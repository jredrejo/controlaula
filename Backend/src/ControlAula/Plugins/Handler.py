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
                'disableBigbrother':self.disableBigBrother,
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
                'broadcast':self.broadcast,
                'sendmessage':self.sendMessage,
                'sendfile':self.sendFile,
                'startapplication':self.startApp,
                'launchweb':self.launchUrl ,
                'disableSound':self.disableSound,
                'enableSound':self.enableSound,
                'getVideoNodes':self.fileBrowserVideo,
                'getAllNodes':self.fileBrowserAll,
                'getCaptures':self.getCaptures
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
        self.usersCommand(Desktop.setBigBrother)
        MyUtils.backupDir (Configs.IMAGES_DIR,Configs.IMAGES_DIR + '_bb')               
        self.classroom.myVNC.activeBB=True
        
    def disableBigBrother(self):
        self.classroom.myVNC.activeBB=False
        self.usersCommand(Desktop.resetBigBrother)        
        MyUtils.restoreDir (Configs.IMAGES_DIR + '_bb',Configs.IMAGES_DIR)  
        
                        
    def enableProjector(self):
        self.classroom.myVNC.startServer()
        self.usersCommand(Desktop.setProjector)            
        
    def disableProjector(self):
        self.classroom.myVNC.stop()
        self.usersCommand(Desktop.resetProjector)  


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
                                  
                        
    def broadcast(self, url='', isDVD=False):
        from os.path import isfile
        if url=='DVD':
            isDVD=True
            url=''
        if not isDVD:
            if not isfile(url):
                return {'result':'Bad file'}          

        self.classroom.broadcast.add_callback('started',self.startbcast)
        self.classroom.broadcast.add_callback('ended',self.stopbcast)
        self.classroom.broadcast.transmit(url,isDVD)

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
        import mimetypes
        path=node[0]
        result=[]
        if path=='home':
            path=MyUtils.getHomeUser()
        for f in os.listdir(path):
            if f[:1]=='.':#skip hidden files and dirs
                continue
            ff=os.path.join(path,f)
            item={'text':f,'id':ff,'cls':'folder'}
            if not os.path.isdir(ff):
                mtype=mimetypes.guess_type(f,True)[0]
                type=''
                if mtype!=None:
                    type=mtype[:5] 
                if type not in ['audio','video']:#skip non-multimedia files
                    continue
                item['cls']='file'
                item['leaf']=True
            result.append(item)
          
        return result
       
    def fileBrowserAll(self,node):
        path=node[0]
        result=[]
        if path=='home':
            path=MyUtils.getHomeUser()
        for f in os.listdir(path):
            if f[:1]=='.':#skip hidden files and dirs
                continue
            ff=os.path.join(path,f)
            item={'text':f,'id':ff,'cls':'folder'}
            if not os.path.isdir(ff):
                item['cls']='file'
                item['leaf']=True
            result.append(item)
          
        return result     
    
    def sendMessage(self, text):
        pass
    def startApp(self,command):
        pass 

    def getCaptures(self,command):
        return {"images":[{"pcname":"a25-o01","username":"aperez","lastmod":1265667056000,"url":"capturas\/Pantallazo-1.png"},{"pcname":"a25-o02","username":"aperez2","lastmod":1265667056000,"url":"capturas\/Pantallazo-2.png"},{"pcname":"a25-o03","username":"aperez3","lastmod":1265667056000,"url":"capturas\/Pantallazo-3.png"},{"pcname":"a25-o04","username":"aperez4","lastmod":1265667056000,"url":"capturas\/Pantallazo-4.png"},{"pcname":"a25-o05","username":"aperez5","lastmod":1265667056000,"url":"capturas\/Pantallazo-5.png"},{"pcname":"a25-o06","username":"aperez6","lastmod":1265667056000,"url":"capturas\/Pantallazo-3.png"},{"pcname":"a25-o07","username":"aperez7","lastmod":1265667056000,"url":"capturas\/Pantallazo-1.png"},{"pcname":"a25-o08","username":"aperez8","lastmod":1265667056000,"url":"capturas\/Pantallazo-2.png"},{"pcname":"a25-o09","username":"aperez9","lastmod":1265667056000,"url":"capturas\/Pantallazo-3.png"},{"pcname":"a25-o10","username":"aperez0","lastmod":1265667056000,"url":"capturas\/Pantallazo-4.png"}]}