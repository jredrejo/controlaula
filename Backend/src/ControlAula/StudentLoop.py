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
from ControlAula.Utils import NetworkUtils, MyUtils,Configs,ping
from ControlAula.Plugins  import StudentHandler,Actions,VNC, Broadcast
from ControlAula import ScanTeachers
import logging
import datetime
from twisted.internet import reactor     
from twisted.internet.protocol import DatagramProtocol
from twisted.internet.protocol import ReconnectingClientFactory
from ClassProtocol import ControlProtocol

MCAST_ADDR = "224.0.0.1"
MCAST_PORT = 11011

class ControlFactory(ReconnectingClientFactory):
    protocol = ControlProtocol

    def buildProtocol(self, address):
        self.resetDelay()        
        proto = ReconnectingClientFactory.buildProtocol(self, address)
        return proto

        
            
class MulticastClientUDP(DatagramProtocol):
    def __init__(self, obey):
        self.obey=obey
        reactor.callLater(15, self.timedOut)

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

    def timedOut(self):
        logging.getLogger().debug("UDP timed out")
        try:
            self.transport.stopListening()
        except:
            pass #avoid ugly errors when stopping the daemon         
        if self.obey.catched =='':     
            try:
                reactor.listenUDP(0, MulticastClientUDP(self.obey)).write('ControlAula', (MCAST_ADDR, MCAST_PORT))
            except:
                logging.getLogger().debug("couldn't create an udp socket")#due to network issues, there's no chance to do an udp connection
           
            
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
        self.last_ping=datetime.datetime.now()
        self.last_logged=self.last_ping
        self.last_teacher=self.last_ping
        
    def startScan(self):
        try:
            self.monitor = ScanTeachers.AvahiMonitor()    
            self.monitor.add_callback('new-service', self._add_teacher)
            self.monitor.add_callback('remove-service',   self._remove_teacher)
            self.monitor.start()
        
        except Exception, ex:
            logging.getLogger().error("Couldn't initialize Avahi monitor: %s" % str(ex))
            #sys.exit()        
        try:
            reactor.listenUDP(0, MulticastClientUDP(self)).write('ControlAula', (MCAST_ADDR, MCAST_PORT))
        except:
            logging.getLogger().debug("couldn't create an udp socket")#due to network issues, there's no chance to do an udp connection
        

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
        
        #check different reasons to switch off (if you're root and your hostname has a classroom-oXX format:       
        if self.mylogin=='root' :
            number=MyUtils.getDesktopNumber(self.myHostname)            
            if Configs.RootConfigs['offactivated'] == '1' and self.isLTSP != '' and number != '':
                p=ping.do_one("192.168.0.254", 0.1)
                if p is not None: 
                    self.last_ping=datetime.datetime.now()
                else:
                    self.off_if_timeout(self.last_ping)                  
                
            if Configs.RootConfigs['offteacher']=='1':
                if self.catched=='':
                    self.off_if_timeout(self.last_teacher)
                else:
                    self.last_teacher= datetime.datetime.now()                                       
            
            if Configs.RootConfigs['offwithoutlogin']=='1':
                active=False
                if self.myVNC is not None:
                    if self.myVNC.procViewer is not None:
                        active=(self.myVNC.procViewer.poll() is None)
                if self.broadcast is not None:
                    if self.broadcast.procRx is not None:
                        active=active or (self.broadcast.procRx.poll() is None)
                                    
                if self.isLTSP=='':
                    not_user_logged=MyUtils.not_ltsp_logged()
                else:
                    not_user_logged=MyUtils.ltsp_logged()
                if not_user_logged and not active:
                    self.off_if_timeout(self.last_logged)
                else:
                    self.last_logged=datetime.datetime.now()
 
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
        self.factory = ControlFactory()
        self.factory.maxRetries = 10
        reactor.connectTCP(teacherIP, newteacher[1] + 1, self.factory)
        self.factory.protocol.add_callback("lost", self.removeMyTeacher)
        self.factory.protocol.add_callback("connected", self.listen)        
        self.factory.protocol.add_callback("commands",self.handleCommands)
        self.catched=name
        self.myIp=NetworkUtils.get_ip_inet_address(teacherIP) 
        self.myMAC=NetworkUtils.get_inet_HwAddr(teacherIP)
        self.handler.myteacher=self.myteacher
        self.handler.teacherIP=teacherIP
        self.handler.teacher_port=str(newteacher[1])
        self.handler.myIP=self.myIp
        self.sendPhoto()
        self.getTeacherData()
        
        
    def sendPhoto(self):  
        if self.mylogin !='root':
            face=MyUtils.getFaceFile()
            if face=='':
                logging.getLogger().debug('The user %s has not photo to send' % (self.mylogin))
            else:
                try:
                    f = xmlrpclib.Binary(open(face, 'rb').read())
                    self.myteacher.facepng(self.mylogin,self.myIp,f)         
                except:
                    logging.getLogger().error('The user %s could not send its photo' % (self.mylogin))
                
                
    def checkClass(self,data={}):
        if Configs.RootConfigs['classroomname']==data['classroomname']:
            return True#it's a teacher of my classroom
        elif MyUtils.classroomName()==data['classroomname']:
            return True #network has changed and the computer now is associated to a new network
        elif Configs.RootConfigs['classroomname']=="noclassroomname":
            try:
                if self.myteacher==None: #There's no classroomname, so link to the first one
                    return (data["ipINET"][:7]==NetworkUtils.get_ip_inet_address()[:7])
            except: #if there is already a myteacher, self.myteacher==None will fail:
                return False
            
        else:
            return False    
    
    
    def removeMyTeacher(self):
        if self.Teachers.has_key(self.catched): #in case avahi hasn't detected the teacher has already gone..
            self.Teachers.pop(self.catched)        
        self.catched=''
        self.myteacher=None
        if self.mylogin!='root':
            MyUtils.putLauncher()

        try:
            self.factory.stopTrying()
        except:
            pass
                  
        try: #begin again udp scanning
            reactor.listenUDP(0, MulticastClientUDP(self)).write('ControlAula', (MCAST_ADDR, MCAST_PORT))
        except:
            logging.getLogger().debug("couldn't create an udp socket")#due to network issues, there's no chance to do an udp connection
            
        
    def getTeacherData(self):
        vncrp,vncwp,vncport,bcastport=self.myteacher.connData()
        self.myVNC=VNC.VNC(False,vncrp,vncwp,vncport)
        self.broadcast=Broadcast.Vlc(bcastport)
        self.handler.myVNC=self.myVNC
        self.handler.myBcast=self.broadcast

    def handleCommands(self, orders):
        for i in orders:
            if self.handler.existCommand(i[0]):
                self.handler.args=i[1:]
                if self.handler.args[0][0] == '[' and self.handler.args[0][-1] == ']':
                    # convert strings back to lists
                    lista_string=self.handler.args[0][1:-1]
                    lista_convertida=lista_string.split("',")
                    self.handler.args[0]=[item[1:-1] for item in lista_convertida]
                   
                self.handler.process(i[0])
        
    def off_if_timeout(self,initial_time):
        if datetime.datetime.now()>(initial_time+ datetime.timedelta(seconds=int(Configs.RootConfigs['offtimeout'] ))):
            Actions.switch_off()