##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:    SutdentLoop.py
# Purpose:     Class listen to the teacher and execute his orders
# Language:    Python 2.5
# Date:        22-Jan-2010.
# Ver:        29-Jan-2010.
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

import xmlrpclib
from Utils import NetworkUtils, MyUtils,Configs

class Obey(object):
    '''
   What the student must do :D
    '''


    def __init__(self, teachers,interval):
        '''
        Constructor
        '''
        self.Teachers=teachers
        self.interval=interval
        self.mylogin=MyUtils.getLoginName()
        self.myFullName=MyUtils.getFullUserName()
        self.myHostname=NetworkUtils.getHostName()
        self.myteacher=None
        self.catched=''
        self.myMAC=''
        
        
    def listen(self):
        from twisted.internet import reactor           
        if     self.catched !='':
            #Keep the user as an active user
            try:
                order=self.myteacher.hostPing( self.mylogin, self.myIp )
                if order=='commands':
                    self.getCommands()
            except:
                self.removeMyTeacher()
                
                
        reactor.callLater(self.interval, self.listen)
        
    def newTeacher(self,name):
        newteacher=self.Teachers[name]
        #pending: checkings to be sure this is the right teacher
        self.myteacher=xmlrpclib.Server('http://'+str( newteacher[0]) + ':' + str(newteacher[1]) + '/RPC2')
        self.catched=name
        self.myIp=NetworkUtils.get_ip_inet_address(str(newteacher[0] )) 
        self.myMAC=NetworkUtils.get_inet_HwAddr(str(newteacher[0]))
        order=self.myteacher.hostPing( self.mylogin, self.myIp )
        if order=='new':

            if self.mylogin !='root':
                #pending catch configurations and photo
                #_addUser(self.mylogin,self.myHostname,self.myIp,
                #                    ltsp=False,classname='',username=self.myFullName,ipLTSP='',
                #                 internetEnabled=True, mouseEnabled=True,soundEnabled=False,
                #              messagesEnabled=False,photo='')                
                self.myteacher.addUser(self.mylogin,self.myHostname,self.myIp,
                                       MyUtils.isLTSP(),Configs.classroomName()   ,self.myFullName,MyUtils.ipLTSP,
                                      1,1,1,0,'')            
            else:
                #_addHost(self, login,hostname,hostip,mac,ltsp=False,
                #classname='',internetEnabled=True):
                self.myteacher.addHost('root',self.myHostname,self.myIp, self.myMAC,
                                       MyUtils.isLTSP(),Configs.classroomName(),1)
                
                
                
        elif order == 'commands':
            self.getCommands()

    def removeMyTeacher(self):
        self.Teachers.pop(self.catched)        
        self.catched=''
        self.myteacher=None

    def getCommands(self):
        commands=self.myteacher.getCommands( self.mylogin, self.myIp )
        for i in commands:
            print i
        
        
