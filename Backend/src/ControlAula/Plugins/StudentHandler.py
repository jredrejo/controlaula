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
from ControlAula.Utils import Configs,MyUtils
from ControlAula.Plugins import DownloadFiles
import Actions

class Plugins(object):
    
    def __init__(self,myteacher,myIP):
        self.args=[]
        self.targets=[]    
        self.myteacher=myteacher
        self.myIP=myIP
        self.myVNC=None
        self.myBcast=None
        self.teacherIP=''
        self.display=  None
        self.handlers = { 
                'bigbrother':self.bigBrother,
                'resetbigbrother':self.disableBigBrother,
                'projector':self.projector,
                'enableInternet':self.enableInternet,
                'disableInternet':self.disableInternet,
                'enableMouse':self.enableMouse,
                'disableMouse':self.disableMouse,
                'enableSound':self.enableSound,
                'disableSound':self.disableSound,
                'enableMessages':self.enableMessages,
                'disableMessages':self.disableMessages,
                'sleep':self.sleep,        
                'broadcast':self.broadcast,
                'stopBroadcast':self.stopBroadcast,
                'sendmessage':self.sendMessage,
                'receiveFile':self.receiveFile,
                'receiveDir':self.receiveDir,                
                'startapplication':self.startApp,
                'launchweb':self.launchUrl ,
                'disableSound':self.disableSound,
                'enableSound':self.enableSound           
                }  
        self.currentProcess=None
        self.filesQueue=DownloadFiles.DownloadQueue()
        
    def existCommand(self,command):
        return self.handlers.has_key(command)
    
    def process(self,command):        
        if self.handlers.has_key(command):            
            handler=self.handlers[command]
            
            handler(*self.args)
            logging.getLogger().debug('The action is %s with params: %s' %   (str(handler),str(self.args)))


    def bigBrother(self):
        self.myVNC.myteacher=self.myteacher
        self.myVNC.myIP=self.myIP
        self.myVNC.activeBB=True  
        self.myVNC.startServer()    
        
    def disableBigBrother(self):
        self.myVNC.activeBB=False        
        self.myVNC.stop() 
                
    def projector(self):
        self.myVNC.startROViewer(self.teacherIP)
         
    def enableInternet(self):
        Configs.MonitorConfigs.SetGeneralConfig('internet','1')
    def disableInternet(self):
        Configs.MonitorConfigs.SetGeneralConfig('internet','0')
    def enableMouse(self):
        if MyUtils.getLoginName()=='root':
            Actions.enableKeyboardAndMouse(self.display)
        else:
            Configs.MonitorConfigs.SetGeneralConfig('mouse','1')       
    def disableMouse(self):
        if MyUtils.getLoginName()=='root':
            Actions.disableKeyboardAndMouse(self.display)
        else:
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
        import os
        from twisted.internet import reactor
        if os.path.exists('/usr/sbin/ethtool'):
            subprocess.call(['ethtool','-s','eth0','wol','g'])
            
                    
        if MyUtils.isLTSP()=='':                      
            subprocess.Popen(['killall','-9','x-session-manager']).wait()            
        else:
            subprocess.call(['poweroff','-w'])
            try:
                server,socket = MyUtils.getLDMinfo()
                if server!='':
                    subprocess.Popen(['ssh','-O','exit','-S',socket,server]).wait()           
            except:
                pass            
           
            
        self.myteacher.removeHost( self.myIP )
        reactor.callLater(1,self.switchoff)
         
    def switchoff(self):
        if MyUtils.isLTSP()=='':
            subprocess.Popen(['poweroff','-hp'])
        else:
            subprocess.Popen(['poweroff','-fp'])
            
    def broadcast(self, url='', isDVD=False):
        self.myBcast.receive()
        
    def stopBroadcast(self):
        self.myBcast.stop()      
         
    def sendMessage(self, text):
        self.destroyProcess()
        
    def receiveFile(self,url):
        from os.path import join
        file=join(Configs.FILES_DIR,url)        
        url='http://' + self.myteacher._ServerProxy__host + '/sendfile/' + url
        self.filesQueue.addRequest( url, file,self.got_file)

    def receiveDir(self,url):
        from os.path import join
        file=join(Configs.FILES_DIR, '_dirlist_' + url)        
        url='http://' + self.myteacher._ServerProxy__host + '/sendfile/_dirlist_' + url
        self.filesQueue.addRequest( url,file,self.got_list)

    def got_list(self,dloader,file):  
        import os
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
        self.destroyProcess()
        self.currentProcess=subprocess.Popen(['x-www-browser',self.args[0]])
        
    def destroyProcess(self):
        from signal import  SIGTERM
        from os import kill
        if self.currentProcess!=None:
            try:
            #self.procServer.terminate(): not available in python 2.5
                pid=self.currentProcess.pid
                kill(pid, SIGTERM)
            except:
                pass     
          
        
