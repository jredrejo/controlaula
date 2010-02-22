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
from Utils import Configs
from Plugins import Actions

class Plugins(object):
    
    def __init__(self,classroom):
        self.args=[]
        self.targets=[]    
        self.classroom=classroom
        self.myteacher=None
        self.handlers = {
                'classroomConfig':self.classroomConfig,    
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
                'enableSound':self.enableSound           
                }  
    def existCommand(self,command):
        return self.handlers.has_key(command)  
    
    def process(self,command):        
        if self.handlers.has_key(command):            
            handler=self.handlers[command]
            
            handler(*self.args)
            logging.getLogger().debug('The action is %s with params: %s' %   (str(handler),str(self.args)))


    def bigBrother(self):
        pass
    def projector(self):
        pass
    def enableInternet(self):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets and i.login!='':
                key=i.login + '@' + i.ip
                #the user must save its config:
                self.classroom.CommandStack[key].append(('enableInternet'))
                #the host must enable internet to this user:
                self.classroom.CommandStack[i.mainIP].append(('enableInternet',i.login))
                i.internet='1'
                self.classroom.Hosts[i.mainIP].internetEnabled='1'
                self.classroom.LoggedUsers[key].internet='1'
    def disableInternet(self):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets and i.login!='':
                key=i.login + '@' + i.ip
                #the user must save its config:
                self.classroom.CommandStack[key].append(('disableInternet'))
                #the host must disable internet to this user:
                self.classroom.CommandStack[i.mainIP].append(('disableInternet',i.login))
                i.internet='0'
                self.classroom.Hosts[i.mainIP].internetEnabled='0'
                self.classroom.LoggedUsers[key].internet='0'
    def enableMouse(self):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets and i.login!='':
                key=i.login + '@' + i.ip
                self.classroom.CommandStack[key].append(('enableMouse'))
                i.mouse='1'
                self.classroom.LoggedUsers[key].mouse='1'
    def disableMouse(self):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets and i.login!='':
                key=i.login + '@' + i.ip
                self.classroom.CommandStack[key].append(('disableMouse'))
                i.mouse='0'
                self.classroom.LoggedUsers[key].mouse='0'
    def enableMessages(self):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets and i.login!='':
                key=i.login + '@' + i.ip
                self.classroom.CommandStack[key].append(('enableMessages'))
                i.messages='1'
                self.classroom.LoggedUsers[key].messages='1'
    def disableMessages(self):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets and i.login!='':
                key=i.login + '@' + i.ip
                self.classroom.CommandStack[key].append(('disableMessages'))
                i.messages='0'
                self.classroom.LoggedUsers[key].messages='0'
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
                self.classroom.CommandStack[i.mainIP].append(('sleep'))        
    def disableSound(self):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets and i.login!='':
                key=i.login + '@' + i.ip
                self.classroom.CommandStack[key].append(('disableSound'))
                i.sound='0'
                self.classroom.LoggedUsers[key].sound='0'
    def enableSound(self):
        for i in self.classroom.Desktops:
            if i.hostname in self.targets and i.login!='':
                key=i.login + '@' + i.ip
                self.classroom.CommandStack[key].append(('enableSound'))
                i.sound='1'
                self.classroom.LoggedUsers[key].sound='1'
        
    def broadcast(self, url='', isDVD=False):
        pass
    def sendMessage(self, text):
        pass
    def sendFile(self,url):
        pass
    def startApp(self,command):
        pass
    def launchUrl(self,url):
        pass
          
    def classroomConfig(self):
        for i in range(0, len(self.targets)-1):
            if self.targets[i]=='Sin equipo':
                self.targets[i]='None'
        self.classroom.oldJSON=''
        self.classroom.redistributeDesktops(self.targets)
        