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
# HMIServer is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
# You should have received a copy of the GNU General Public License
# along with ControlAula. If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
import logging
from Utils import Configs,MyUtils
from Plugins import Actions

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
                'projector':self.projector,
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
                'getNodes':self.fileBrowser  
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
            


    def bigBrother(self):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets and i.login!='':
                self.classroom.CommandStack[i.userkey].append(['bigBrother'])
    
    def projector(self):
        self.classroom.myVNC.startServer()
        for i in self.classroom.Desktops:
            if i.hostname in self.targets:
                self.classroom.CommandStack[i.mainIP].append(['projector'])
                if i.userkey!='':
                    #self.KeyboardMouse(i,'0','disableMouse')
                    pass

    def sendBB(self,desktop,value,command):
        self.classroom.CommandStack[desktop.userkey].append([command])
                    
    def usersCommand(self,func,value,command):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets and i.login!='':
                func(i,value,command)
                        
    def enableInternet(self):
        self.usersCommand(self.Internet,'1','enableInternet')
                
    def disableInternet(self):
        self.usersCommand(self.Internet,'0','disableInternet')
                
    def Internet(self,desktop,value,command):
        self.classroom.CommandStack[desktop.userkey].append([command])
        #the host must disable internet to this user:
        self.classroom.CommandStack[desktop.mainIP].append([command,desktop.login])
        desktop.internet=value
        self.classroom.Hosts[desktop.mainIP].internetEnabled=value
        self.classroom.LoggedUsers[desktop.userkey].internet=value
                
    def enableMouse(self):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets:
                self.KeyboardMouse(i,'1','enableMouse')
               
    def disableMouse(self):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets:
                self.KeyboardMouse(i,'0','disableMouse')        

    def KeyboardMouse(self,desktop,value,command):
        self.classroom.CommandStack[desktop.mainIP].append([command])       
        desktop.mouse=value
        if desktop.userkey!='':
            self.classroom.CommandStack[desktop.userkey].append([command])
            self.classroom.LoggedUsers[desktop.userkey].mouse=value
            
                        
    def enableMessages(self):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets and i.login!='':
                self.Messages(i, '0', 'enableMessages')
                
    def disableMessages(self):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets and i.login!='':
                self.Messages(i, '0', 'disableMessages')

                
    def Messages(self,desktop,value,command):
        self.classroom.CommandStack[desktop.userkey].append([command])
        desktop.messages=value
        self.classroom.LoggedUsers[desktop.userkey].messages=value       
        
        
    def wakeup(self):
        macs=[]
        for i in self.targets:
            mac=Configs.MonitorConfigs.GetMAC(i)
            if mac !='':                
                macs.append(mac)                
        Actions.sendWOLBurst(macs, 2)                         
                
    def sleep(self):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets:
                self.classroom.CommandStack[i.mainIP].append(['sleep'])  
                      
    def disableSound(self):
        self.usersCommand(self.Sound,'0','disableSound')
                
    def enableSound(self):
        self.usersCommand(self.Sound,'1','enableSound')
                     
    def Sound(self,desktop,value,command):
        self.classroom.CommandStack[desktop.userkey].append([command])
        desktop.sound=value
        self.classroom.LoggedUsers[desktop.userkey].sound=value
                        
    def broadcast(self, url='', isDVD=False):
        from os.path import isfile
        if url=='DVD':
            isDVD=True
            url=''
        if not isDVD:
            if not isfile(url):
                return {'result':'Bad file'}
        if not self.classroom.broadcast.transmit(url,isDVD):
            return {'result':'Bad DVD'}
        for i in self.classroom.Desktops:
            if i.hostname in self.targets:
                self.classroom.CommandStack[i.mainIP].append(['broadcast',url,isDVD])  
                
    def sendMessage(self, text):
        pass
    def sendFile(self,url):
        pass
    def startApp(self,command):
        pass
    def launchUrl(self,url):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets and i.login!='':
                self.classroom.CommandStack[i.userkey].append(['launchweb',url])      
          
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
            
    def fileBrowser(self,node):
        import os,mimetypes
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
       
            