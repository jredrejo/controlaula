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
from Plugins  import StudentHandler,Actions
import logging

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
        self.handler=StudentHandler.Plugins(None,None)
        
    def listen(self):
        from twisted.internet import reactor           
        if     self.catched !='':
            #Keep the user as an active user
            try:                
                order=self.myteacher.hostPing( self.mylogin, self.myIp )
                self.sendData(order)
            except:
                self.removeMyTeacher()
                
            if Configs.MonitorConfigs.GetGeneralConfig('sound')=='0':
                Actions.setSound('mute')
                
        reactor.callLater(self.interval, self.listen)
        
    def newTeacher(self,name):
        newteacher=self.Teachers[name]
        #pending: checkings to be sure this is the right teacher
        self.myteacher=xmlrpclib.Server('http://'+str( newteacher[0]) + ':' + str(newteacher[1]) + '/RPC2')

        self.catched=name
        self.myIp=NetworkUtils.get_ip_inet_address(str(newteacher[0] )) 
        self.myMAC=NetworkUtils.get_inet_HwAddr(str(newteacher[0]))
        self.handler.myteacher=self.myteacher
        self.handler.myIP=self.myIp
        order=self.myteacher.hostPing( self.mylogin, self.myIp )
        self.sendData(order)
        
        
    def sendData(self,order):
        if order=='new':

            if self.mylogin !='root':
                #pending catch configurations and photo
                #self,login, hostname,hostip,ltsp=False,classname='',username='',
                #ipLTSP='',internetEnabled=True,mouseEnabled=True,
                #soundEnabled=True,messagesEnabled=False,photo=''):
                            
                self.myteacher.addUser(self.mylogin,self.myHostname,self.myIp, (MyUtils.isLTSP()!=''),
                                      Configs.RootConfigs['classroomname']  ,self.myFullName,MyUtils.isLTSP(),
                                      Configs.MonitorConfigs.GetGeneralConfig('internet') ,
                                      Configs.MonitorConfigs.GetGeneralConfig('mouse') ,
                                      Configs.MonitorConfigs.GetGeneralConfig('sound'),
                                      Configs.MonitorConfigs.GetGeneralConfig('messages'), '')       
                
                face=MyUtils.getFaceFile()
                if face=='':
                    logging.getLogger().debug('The user %s has not photo to send' % (self.mylogin))
                else:
                    try:
                        f = xmlrpclib.Binary(open(face, 'rb').read())
                        self.myteacher.facepng(self.mylogin,self.myIp,f)         
                    except:
                        logging.getLogger().error('The user %s could not send its photo' % (self.mylogin))

                     
            else:
                #_addHost(self, login,hostname,hostip,mac,ltsp=False,
                #classname='',internetEnabled=True):
                logging.getLogger().debug('Sending to the teacher this info: %s,%s,%s,%s,%s' % (self.myHostname,self.myIp, self.myMAC,
                                       MyUtils.isLTSP(),Configs.RootConfigs['classroomname']))
                self.myteacher.addHost('root',self.myHostname,self.myIp, self.myMAC,
                                       MyUtils.isLTSP(),Configs.RootConfigs['classroomname'],1)
                
                
                
        elif order == 'commands':
            self.getCommands()

    def removeMyTeacher(self):
        if self.Teachers.has_key(self.catched): #in case avahi hasn't detected the teacher has already gone..
            self.Teachers.pop(self.catched)        
        self.catched=''
        self.myteacher=None

    def getCommands(self):
        commands=self.myteacher.getCommands( self.mylogin, self.myIp )
        for i in commands:
            if self.handler.existCommand(i):
                self.handler.process(i)
        
        
