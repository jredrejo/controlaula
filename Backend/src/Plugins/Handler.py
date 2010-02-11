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

class Plugins(object):
    
    def __init__(self,classroom):
        self.args=[]
        self.targets=[]    
        self.classroom=classroom
        self.handlers = {
                'bigbrother':self.bigBrother,
                'projector':self.projector,
                'enableInternet':self.enableInternet,
                'disableInternet':self.disableInternet,
                'enableMouse':self.enableMouse,
                'disableMouse':self.disableMouse,
                'sharePrinter':self.sharePrinter,
                'unsharePrinter':self.unsharePrinter,
                'enableMessages':self.enableMessages,
                'disableMessages':self.disableMessages,
                'wakeup':self.wakeup,
                'sleep':self.sleep,        
                'broadcast':self.broadcast,
                'sendmessage':self.sendMessage,
                'sendfile':self.sendFile,
                'startapplication':self.startApp,
                'launchweb':self.launchUrl               
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
        pass
    def disableInternet(self):
        pass
    def enableMouse(self):
        pass
    def disableMouse(self):
        pass
    def sharePrinter(self):
        pass
    def unsharePrinter(self):
        pass   
    def enableMessages(self):
        pass
    def disableMessages(self):
        pass
    def wakeup(self):
        pass
    def sleep(self):
        pass
        
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
          
        