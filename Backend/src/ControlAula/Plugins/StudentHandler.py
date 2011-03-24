##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:    StudentHandler.py
# Purpose:     Student handler of the different Plugins 
# Language:    Python 2.5
# Date:        3-Feb-2010.
# Ver:        3-Feb-2010.
# Author:    José L.  Redrejo Rodríguez
# Copyright:    2009-2010 - José L. Redrejo Rodríguez       <jredrejo @nospam@ debian.org>
#
# ControlAula is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# ControlAula is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
# You should have received a copy of the GNU General Public License
# along with ControlAula. If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
import logging,subprocess
from ControlAula.Utils import Configs,MyUtils,NetworkUtils
from ControlAula.Plugins import DownloadFiles
import Actions
import os,xmlrpclib
import urllib,mimetypes
class Plugins(object):
    
    def __init__(self,myteacher,myIP):
        self.args=[]
        self.targets=[]    
        self.myteacher=myteacher
        self.myIP=myIP
        self.myVNC=None
        self.myBcast=None
        self.teacherIP=''
        self.teacher_port='8900'
        self.handlers = { 
                'bigbrother':self.bigBrother,
                'disablebigbrother':self.disableBigBrother,
                'projector':self.projector,
                'resetProjector':self.resetProjector,                
                'enableInternet':self.enableInternet,
                'disableInternet':self.disableInternet,
                'rootenableInternet':self.rootEnableInternet,
                'rootdisableInternet':self.rootDisableInternet,    
                'rootClean':self.rootClean,            
                'enableMouse':self.enableMouse,
                'disableMouse':self.disableMouse,
                'enableSound':self.enableSound,
                'disableSound':self.disableSound,
                'enableMessages':self.enableMessages,
                'disableMessages':self.disableMessages,
                'sleep':self.sleep,        
                'broadcast':self.broadcast,
                'stopBroadcast':self.stopBroadcast,
                'receiveMessage':self.receiveMessage,
                'receiveFile':self.receiveFile,
                'receiveDir':self.receiveDir,                
                'startapplication':self.startApp,
                'launchweb':self.launchUrl ,
                'disableSound':self.disableSound,
                'enableSound':self.enableSound,
                'getAllNodes':self.fileBrowserAll,
                'openFile':self.openSendFiles ,
                'sendFile':self.sendFile               
                }  
        self.currentProcess=None
        self.filesQueue=DownloadFiles.DownloadQueue()
        
    def existCommand(self,command):
        return self.handlers.has_key(command)
    
    def process(self,command):        
        if self.handlers.has_key(command):
            #whenever a order arrives, the screensaver is killed  
            try:
                subprocess.Popen(["gnome-screensaver-command","--exit"])
            except OSError, e: 
                logging.getLogger().debug('Killing screensaver failed with this error number: %s and text: %s' %  (e.errno, e.strerror) )
            handler=self.handlers[command]
            
            handler(*self.args)
            logging.getLogger().debug('The action is %s with params: %s' %   (str(handler),str(self.args)))


    def bigBrother(self):
        self.myVNC.myteacher=self.myteacher
        self.myVNC.myIP=self.myIP
        self.myVNC.activeBB=True  
        self.myVNC.startServer()    
        
    def disableBigBrother(self):
        self.myVNC.stop() 
        self.myVNC.activeBB=False            
                
    def projector(self):
        self.myVNC.startROViewer(self.teacherIP)

    def resetProjector(self):
        self.myVNC.stop()
                 
    def enableInternet(self):
        Configs.MonitorConfigs.SetGeneralConfig('internet','1')
              
    def disableInternet(self):
        Configs.MonitorConfigs.SetGeneralConfig('internet','0')
        
    def rootClean(self,bcastnet,gw):  
        NetworkUtils.cleanRoutes()      
        NetworkUtils.addRoute(bcastnet,gw)
        
    def rootEnableInternet(self,login):
        try:
            p1=subprocess.Popen(['iptables-save'],stdout=subprocess.PIPE).communicate()[0]
            for i in p1.split('\n'):
                if i[:9]=='-A OUTPUT':
                    if i.find('--uid-owner ' + login) >-1:
                        command='iptables -D' + i[2:]
                        subprocess.Popen(command,shell=True)
        
        except:
            pass
        
    def rootDisableInternet(self,login):
        command=['iptables','-I','OUTPUT','-p','tcp','-m','multiport','--dports']
        command +=['21,23,80,143,194,443,445','-m','owner','--uid-owner',login,'-j','DROP']
        subprocess.Popen(command)
        
    def enableMouse(self):        
        Actions.enableKeyboardAndMouse()
        if MyUtils.getLoginName()!='root':
            Configs.MonitorConfigs.SetGeneralConfig('mouse','1')       
    def disableMouse(self):
        Actions.disableKeyboardAndMouse()
        if MyUtils.getLoginName()!='root':            
            Configs.MonitorConfigs.SetGeneralConfig('mouse','0')    
    def enableSound(self):
        Configs.MonitorConfigs.SetGeneralConfig('sound','1')
        Actions.setSound('unmute')
    def disableSound(self):
        Configs.MonitorConfigs.SetGeneralConfig('sound','0')
        Actions.setSound('mute')

    def enableMessages(self):
        Configs.MonitorConfigs.SetGeneralConfig('messages','1')
    def disableMessages(self):
        Configs.MonitorConfigs.SetGeneralConfig('messages','0')

    def sleep(self):
        Actions.switch_off()
        
    def broadcast(self, url='', isDVD=False):
        self.myBcast.receive()
        
    def stopBroadcast(self):
        if self.myBcast is not None:
            self.myBcast.stop()      
         
    def receiveMessage(self, text):
        import pynotify
        pynotify.init('controlaula')
        n=pynotify.Notification("Mensaje del profesor",text,"dialog-warning")
        n.set_timeout(pynotify.EXPIRES_NEVER)
        n.show()
        
    def receiveFile(self,url):
        from os.path import join
        file=join(Configs.FILES_DIR,url)        
        url='http://' + self.myteacher._ServerProxy__host + '/sendfile/' + urllib.quote(url)
        self.filesQueue.addRequest( url, file,self.got_file)

    def receiveDir(self,url):
        from os.path import join
        file=join(Configs.FILES_DIR, '_dirlist_' + url)        
        url='http://' + self.myteacher._ServerProxy__host + '/sendfile/_dirlist_' + urllib.quote(url)
        self.filesQueue.addRequest( url,file,self.got_list)

    def got_list(self,dloader,file):  
        dirname=os.path.basename( file)[9:]
        dirpath=os.path.join(Configs.FILES_DIR,dirname)
        try:
            os.mkdir(dirpath)
        except:
            pass
        
        filelist=open(file, "r").read().strip().split()
        try:
            os.remove(file)
        except:
            pass

        for i in filelist:
            url='http://' + self.myteacher._ServerProxy__host + '/sendfile/' + dirname + '/' + i
            newfile=os.path.join(dirpath,i)
            self.filesQueue.addRequest( url, newfile,lambda x:x)
        
        self.got_file(None,dirpath + os.sep)
        
    def got_file(self,dloader,file):        
        import os.path
        commands={'gnome':'nautilus','kde':'konqueror','xfce':'thunar','lxde':'pcmanfm'}

        desktop=MyUtils.guessDesktop()            
        if desktop in commands:
            command=commands[desktop]
        else:
            command='thunar'
            
        try:
            subprocess.Popen([command,os.path.dirname(file)])
        except:
            pass #not recognized file browser
        
    def startApp(self,command):
        pass
    
    def launchUrl(self,url):       
        try:
            import webbrowser
            webbrowser.open(url)
        except:
            logging.getLogger().error('Unable to detect your browser when launching %s' %   (url))
          
    def getPathUser(self):
        return MyUtils.getHomeUser()

    def fileBrowserAll(self,node,video=False):
        path=urllib.unquote(unicode(node[0])).encode( "utf-8" )

        if path=='home':
            return self.getTreeHome()

        if path=='receivedFiles':
            path=Configs.FILES_DIR
            
        r=['<ul class="jqueryFileTree" style="display: none;">']
        try:

            files_and_dirs=os.listdir(path)
            sorted_files_and_dirs=sorted(files_and_dirs,key=lambda x: (x.lower(),x.swapcase()))
            for f in sorted_files_and_dirs:
                if f[:1]=='.':#skip hidden files and dirs
                    continue
                ff=os.path.join(path,f)  
                       
                if os.path.isdir(ff):
                    r.append('<li class="directory collapsed"><a href="#" rel="%s/">%s</a></li>' % (ff,f))
                    
                else:
                    if video:
                        mtype=mimetypes.guess_type(f,True)[0]
                        type=''
                        if mtype!=None:
                            type=mtype[:5] 
                        if type not in ['audio','video']:#skip non-multimedia files
                            continue                                 
                    
                    e=os.path.splitext(f)[1][1:] # get .ext and remove dot
                    r.append('<li class="file ext_%s"><a href="#" rel="%s">%s</a></li>' % (e,ff,f))
              
        except Exception,e:
            r.append('Could not load directory: %s' % str(e))
        r.append('</ul>')
        
        self.myteacher.getAnswer(MyUtils.getLoginName(),self.myIP,  ''.join(r))

    def getTreeHome(self):
        path=MyUtils.getHomeUser()
        user=MyUtils.getLoginName()
        r=['<ul class="jqueryFileTree" style="display: none;">']
        r.append('<li class="directory collapsed"><a href="#" rel="%s/">%s</a></li>' % (path,user))
        r.append('<li class="directory collapsed"><a href="#" rel="/media/">Media</a></li>' )        
        r.append('</ul>')
        
        self.myteacher.getAnswer(MyUtils.getLoginName(),self.myIP,  ''.join(r))   
        
    def openSendFiles(self,path):
        import os.path
        if type(path)==type([]):
            path=path[0]

        commands={'gnome':'nautilus','kde':'konqueror','xfce':'thunar','lxde':'pcmanfm'}
        desktop=MyUtils.guessDesktop()            
        if desktop in commands:
            command=commands[desktop]
        else:
            command='thunar'

        if path=='dirReceivedTeacher':
            file_path=Configs.FILES_DIR
        else:
            file_path=os.path.dirname( os.path.join(Configs.FILES_DIR,path))
                   
        try:
            subprocess.Popen([command,file_path])
        except:
            pass #not recognized file browser        

    def sendFile(self,path):
        if type(path)==type([]):
            path=path[0]
         
        f = xmlrpclib.Binary(open(path, 'rb').read())
        self.myteacher.file(MyUtils.getLoginName(), f, os.path.basename(path) )
                
