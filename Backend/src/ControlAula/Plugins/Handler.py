##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:    Handler.py
# Purpose:     Handler of the different Plugins
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
import logging,os
import urllib,mimetypes
from ControlAula.Utils import Configs,MyUtils
from ControlAula.Plugins import Actions
from ControlAula.Desktop import Desktop

class Plugins(object):
    
    def __init__(self,classroom):
        self.args=[]
        self.targets=[]    
        self.classroom=classroom
        self.myteacher=None
        self.handlers = {
                'classroomConfig':self.classroomConfig,    
                'deleteComputer':self.deleteComputer,
                'bigbrother':self.bigBrother,
                'disableBigBrother':self.disableBigBrother,
                'enableProjector':self.enableProjector,
                
                'disableProjector':self.disableProjector,
                'enableInternet':self.enableInternet,
                'disableInternet':self.disableInternet,
                'enableMouse':self.enableMouse,
                'disableMouse':self.disableMouse,
                'enableSound':self.enableSound,
                'disableSound':self.disableSound,
                'enableMessages':self.enableMessages,
                'disableMessages':self.disableMessages,
                'wakeup':self.wakeup,
                'sleep':self.sleep,        
                'openVNC':self.openVNC,
                'broadcast':self.broadcast,
                'broadcastDVD':self.broadcastDVD,
                'sendMessage':self.sendMessage,
                'sendfile':self.sendFile,
                'startapplication':self.startApp,
                'launchweb':self.launchUrl ,
                'disableSound':self.disableSound,
                'enableSound':self.enableSound,
                'getVideoNodes':self.fileBrowserVideo,
                'getAllNodes':self.fileBrowserAll,
                'getCaptures':self.getCaptures,
                'getLoginTeacher':self.getLogin,
                'errorLog':self.errorLog
                }  
        
    def existCommand(self,command):
        return self.handlers.has_key(command)  
    
    def process(self,command):        
        if self.handlers.has_key(command):                   
            handler=self.handlers[command]
            logging.getLogger().debug('The action is %s with params: %s' %   (str(handler),str(self.args)))
            s=handler(*self.args)
            if s==None:
                s={'result':'ack'}
            return s
            
    def usersCommand(self,func,args=[]):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets:
                func(i,*args)
                        
    def enableInternet(self):
        self.usersCommand(Desktop.enableInternet)
                
    def disableInternet(self):
        self.usersCommand(Desktop.disableInternet)
                
                
    def enableMouse(self):
        self.usersCommand(Desktop.enableKeyboardMouse)
              
    def disableMouse(self):
        self.usersCommand(Desktop.disableKeyboardMouse)      

                                    
    def enableMessages(self):
        self.usersCommand(Desktop.enableMessages)
                
    def disableMessages(self):
        self.usersCommand(Desktop.disableMessages)
   

    def bigBrother(self):
        #self.usersCommand(Desktop.setBigBrother)
        for i in self.classroom.Desktops:            
                i.setBigBrother()     
        #MyUtils.backupDir (Configs.IMAGES_DIR,Configs.IMAGES_DIR + '_bb')               
        self.classroom.myVNC.activeBB=True
        
    def disableBigBrother(self):
        self.classroom.myVNC.activeBB=False
        for i in self.classroom.Desktops:            
                i.resetBigBrother()              
        #MyUtils.restoreDir (Configs.IMAGES_DIR + '_bb',Configs.IMAGES_DIR)  
        
    def openVNC(self,computer):
		for i in self.classroom.Desktops:
			if i.hostname==computer:
				self.classroom.myVNC.startViewer( i.hostname,i.ltsp,i.hostkey)
				break 
                        
    def enableProjector(self):
        self.classroom.myVNC.startServer()
        self.usersCommand(Desktop.setProjector)            
        
    def disableProjector(self):
        self.usersCommand(Desktop.resetProjector)  
        self.classroom.myVNC.stop()

    def disableSound(self):
        self.usersCommand(Desktop.disableSound)
                
    def enableSound(self):
        self.usersCommand(Desktop.enableSound)                   
        
        
    def wakeup(self):
        macs=[]
        for i in self.targets:
            mac=Configs.MonitorConfigs.GetMAC(i)
            if mac !='':                
                macs.append(mac)                
        Actions.sendWOLBurst(macs, 2)                         
                
    def sleep(self):
        self.usersCommand(Desktop.sleep)
                                  
    def broadcastDVD(self):
        return self.broadcast('',True)
                        
    def broadcast(self, url='', isDVD=False):
        from os.path import isfile
        if url=='DVD':
            isDVD=True
            url=''
        if not isDVD:
            if not isfile(url):
                return {'result':'Bad file'}          
        self.classroom.broadcast.clean_callbacks() 
        self.classroom.broadcast.add_callback('started',self.startbcast)
        self.classroom.broadcast.add_callback('ended',self.stopbcast)
        result=self.classroom.broadcast.transmit(url,isDVD)
        if result!=True:
            self.stopbcast
            return {'result':result} 

    def startbcast(self,url,isDVD):      
        
        self.usersCommand(Desktop.sendBroadcast,[url,isDVD])

    def stopbcast(self):
        for i in self.classroom.Desktops:
            i.stopBroadcast()
                
   
    def sendFile(self,url):
        import os.path
        from os import symlink
        filename=os.path.basename(url)
        filepath=os.path.join(Configs.FILES_DIR,filename)
        if not os.path.exists(filepath):
            symlink(url,filepath)   
        if os.path.isdir(url):
            command='receiveDir'
            filelist=''
            for f in os.listdir(url):
                if f[:1]=='.':#skip hidden files and dirs
                    continue
                ff=os.path.join(filepath,f)
                if os.path.isdir(ff):#skip inner dirs to avoid recursion
                    continue
                filelist+=f +'\n'
            thelist = open(os.path.join(Configs.FILES_DIR,'_dirlist_' +filename), "w")
            thelist.write(filelist)
            thelist.close()           
        else:
            command='receiveFile'
        
        self.usersCommand(Desktop.sendFile,[command,filename])        

                
    def launchUrl(self,url):
        self.usersCommand(Desktop.launchWeb,[url])
         
          
    def classroomConfig(self,rows=0,cols=0):
        for i in range(0, len(self.targets)-1):
            if self.targets[i]=='Sin equipo':
                self.targets[i]='Unknown'
                

        if rows!=0 or cols!=0:
            if self.classroom.rows <rows:
                self.classroom.addDesktopsRow()
            elif self.classroom.rows >rows:
                self.classroom.removeDesktopsRow()
            if self.classroom.cols <cols:
                self.classroom.addDesktopsCol()
            elif self.classroom.cols >cols:
                self.classroom.removeDesktopsCol()
            else:
                self.classroom.redistributeDesktops(self.targets) 
        
        self.classroom.oldJSON=''                                 
        self.classroom.saveClassLayout()

        
    def deleteComputer(self):
            if self.targets[:2]=='pc':
                index=int(self.targets[2:])
            else:
                index=int(self.targets)
            self.classroom.Desktops[index].hostname='none'
            self.classroom.saveClassLayout()
            
    def fileBrowserVideo(self,node):

        return self.fileBrowserAll(node, True)
 
       
    def fileBrowserAll(self,node,video=False):
        path=urllib.unquote(unicode(node[0])).encode( "utf-8" )

        if path=='home':
            return self.getTreeHome()
            
            
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
        
        return  ''.join(r)

    def getTreeHome(self):
        path=MyUtils.getHomeUser()
        user=MyUtils.getLoginName()
        r=['<ul class="jqueryFileTree" style="display: none;">']
        r.append('<li class="directory collapsed"><a href="#" rel="%s/">%s</a></li>' % (path,user))
        r.append('<li class="directory collapsed"><a href="#" rel="/media/">Media</a></li>' )        
        r.append('</ul>')
        
        return  ''.join(r)        
        
    
    def sendMessage(self, text):
        self.usersCommand(Desktop.sendMessage,[text])
        
    def startApp(self,command):
        pass 

    def getCaptures(self):

        self.bigBrother()
        shots=[]    
        for i in self.classroom.Desktops:
            shots.append(i.getScreenshotInfo())
            
        return {"images":shots}
    
    def getLogin(self):
        return {'login':MyUtils.getLoginName() }

    def errorLog(self,error_msg):
        logging.getLogger().debug('Error report from Frontend: %s ' %   (error_msg))
