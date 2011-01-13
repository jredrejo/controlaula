##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:    SutdentLoop.py
# Purpose:     Class listen to the teacher and execute his orders
# Language:    Python 2.5
# Date:        22-Jan-2010.
# Ver:        1-Nov-2010.
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

import xmlrpclib
from ControlAula.Utils import NetworkUtils, MyUtils,Configs
from ControlAula.Plugins  import StudentHandler,Actions,VNC, Broadcast
from ControlAula import ScanTeachers
import logging
from twisted.internet import reactor     
from twisted.internet.protocol import DatagramProtocol

MCAST_ADDR = "224.0.0.1"
MCAST_PORT = 11011

class MulticastClientUDP(DatagramProtocol):
    def __init__(self, obey):
        self.obey=obey

    def datagramReceived(self, datagram, address):
        data={}
        port=0
        div1=datagram.split("]")
        try:
            name=div1[1]
            div2=div1[0].split("'")
            for i in div2:
                div3=i.split("=")
                if len(div3)==2:
                    if div3[0]=="web":
                        port=int(div3[1])
                        data["web"]=port
                    else:
                        data[div3[0]]=div3[1]              
            
            self.obey._add_teacher(None, name, address[0], port,data)
        except: #bad data received
            pass
            
            
class Obey(object):
    '''
   What the student must do :D
    '''
            
    def __init__(self, interval):
        '''
        Constructor
        '''
        self.Teachers={}
        self.interval=interval
        self.mylogin=MyUtils.getLoginName()
        self.myFullName=MyUtils.getFullUserName()
        self.myHostname=NetworkUtils.getHostName()
        self.myHome=MyUtils.getHomeUser()
        self.myteacher=None
        self.catched=''
        self.myMAC=''
        self.handler=StudentHandler.Plugins(None,None)
        self.myVNC=None
        self.broadcast=None
        self.isLTSP=MyUtils.isLTSP()
        self.monitor=None
        self.myIp=None
        self.startScan()
        
    def startScan(self):
        try:
            self.monitor = ScanTeachers.AvahiMonitor()    
            self.monitor.add_callback('new-service', self._add_teacher)
            self.monitor.add_callback('remove-service',   self._remove_teacher)
            self.monitor.start()
        
        except Exception, ex:
            logging.getLogger().error("Couldn't initialize Avahi monitor: %s" % str(ex))
            #sys.exit()        
        

    def _add_teacher(self, func, name, address, port,data={}):
        #discard ipv6 entries
        if address.find(":") == -1:            
            if MyUtils.isLTSPServer() and NetworkUtils.ltspGW()!=str(address): return                
            if not self.Teachers.has_key(name):
                logging.getLogger().debug('New teacher detected: ' + name)
                self.Teachers[name]=(data['ipINET'],port)
                if self.checkClass(data):
                    self.newTeacher(name)
                else:
                    logging.getLogger().debug(name + ' is not my teacher')
                    
    
    
    def _remove_teacher(self,func, name, address, port):    
        #discard ipv6 entries
        if address.find(":") == -1:
            if  self.Teachers.has_key(name):
                logging.getLogger().debug('teacher disappeared: ' + name)
                if self.catched==name:
                    self.removeMyTeacher()
                else:
                    self.Teachers.pop(name)
                        
    def listen(self):             
        if self.catched !='':         
            #Keep the user as an active user :                       
            try:                
                order=self.myteacher.hostPing( self.mylogin, self.myIp )
                self.sendData(order)
            except: #network jam or teacher left
                pass 
        else:
            reactor.listenUDP(0, MulticastClientUDP(self)).write('ControlAula', (MCAST_ADDR, MCAST_PORT))
            #PENDING: when catched=='' find a way to restart the avahi browsing ¿self.startScan()  , restart controlaula    ?
                            
        if Configs.MonitorConfigs.GetGeneralConfig('sound')=='0':
            Actions.setSound('mute')                                        
        reactor.callLater(self.interval, self.listen)
        
    def newTeacher(self,name):
        #self.getDisplay()         
                  
        if self.myteacher is not None:
            self.removeMyTeacher()
        newteacher=self.Teachers[name]
        #pending: checkings to be sure this is the right teacher
        teacherIP=str( newteacher[0]) 
        if self.mylogin!='root':
            MyUtils.putLauncher( teacherIP,newteacher[1]  , False)
        
        self.myteacher=xmlrpclib.Server('http://'+teacherIP+ ':' + str(newteacher[1]) + '/RPC2')

        self.catched=name
        self.myIp=NetworkUtils.get_ip_inet_address(teacherIP) 
        self.myMAC=NetworkUtils.get_inet_HwAddr(teacherIP)
        self.handler.myteacher=self.myteacher
        self.handler.teacherIP=teacherIP
        self.handler.teacher_port=str(newteacher[1])
        self.handler.myIP=self.myIp
        try:                
            order=self.myteacher.hostPing( self.mylogin, self.myIp )
            self.sendData(order)
        except: #network jam, try again later
            pass
            
        
        
    def sendData(self,order):
        if order=='new':

            if self.mylogin !='root':
                #pending catch configurations and photo
                #self,login, hostname,hostip,ltsp=False,classname='',username='',
                #ipLTSP='',internetEnabled=True,mouseEnabled=True,
                #soundEnabled=True,messagesEnabled=False,photo=''):
                            
                self.myteacher.addUser(self.mylogin,self.myHostname,self.myIp, (self.isLTSP!=''),
                                      Configs.RootConfigs['classroomname']  ,self.myFullName,self.isLTSP,
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
                logging.getLogger().debug('Sending to the teacher this info: %s,%s,%s,%s,%s' % (self.myHostname,self.myIp, self.myMAC,
                                       self.isLTSP,Configs.RootConfigs['classroomname']))
                self.myteacher.addHost('root',self.myHostname,self.myIp, self.myMAC,
                                       self.isLTSP,Configs.RootConfigs['classroomname'],1)
                
                self.getTeacherData()
                
        elif order == 'commands':
            if self.myVNC is not None:
                self.getCommands()
            else:
                self.getTeacherData()

    def checkClass(self,data={}):
        NetworkUtils.getWirelessData()
 
                
                
        if Configs.RootConfigs['classroomname']==data['classroomname']:
            return True#it's a teacher of my classroom
        
        if Configs.RootConfigs['classroomname']=="noclassroomname":
            try:
                return (self.myteacher==None) #There's no classroomname, so link to the first one
            except: #if there is already a myteacher, self.myteacher==None will fail:
                return True
            #PENDING = CHECK MAC
        
        
        return False
    
    def removeMyTeacher(self):
        if self.Teachers.has_key(self.catched): #in case avahi hasn't detected the teacher has already gone..
            self.Teachers.pop(self.catched)        
        self.catched=''
        self.myteacher=None
        if self.mylogin!='root':
            MyUtils.putLauncher()
        
    def getTeacherData(self):
        vncrp,vncwp,vncport,bcastport=self.myteacher.connData()
        self.myVNC=VNC.VNC(False,vncrp,vncwp,vncport)
        self.broadcast=Broadcast.Vlc(bcastport)
        self.handler.myVNC=self.myVNC
        self.handler.myBcast=self.broadcast

    def getCommands(self):
        commands=self.myteacher.getCommands( self.mylogin, self.myIp )
        for i in commands:
            if self.handler.existCommand(i[0]):
                self.handler.args=i[1:]
                self.handler.process(i[0])
        