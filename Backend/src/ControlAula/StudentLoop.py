##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:    StudentLoop.py
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
import os
import simplejson as json
from twisted.internet import reactor
from twisted import version
from twisted.web import resource, static, server  
from twisted.internet.protocol import ReconnectingClientFactory
from ClassProtocol import ControlProtocol

class ControlAulaProtocol(resource.Resource):
    """Respond with the appropriate ControlAUla  protocol response.
    A GET should return a file. A POST should use JSON to retrieve and send data
    """
    isLeaf = True  # This is a resource end point.

    def render_GET(self, request):
        pagename = request.path[1:].lower()   
        # Check if requested file exists.    
        if request.path[:13]=='/loginimages/' or request.path[:10]=='/sendfile/':
            requestedfile=os.path.join(Configs.APP_DIR ,request.path[1:])
        else:    
            requestedfile = os.path.join(self.PageDir,request.path[1:])
        
        if '/controlaula/' in request.path:
            pagename = request.path[13:]
            if "-" in pagename:
                request.path = request.path[12:]
                                
                requestedfile = os.path.join(Configs.APP_DIR,'controlaula.html')
            else:
                requestedfile = os.path.join(Configs.APP_DIR,pagename)
                               

        if not os.path.isfile(requestedfile):
            # Didn't find it? Return an error.
            request.setResponseCode(404)
            return"""
            <html><head><title>404 - No Such Resource</title></head>
            <body><h1>No Such Resource</h1>
            <p>File not found: %s - No such file.</p></body></html>
            """ % requestedfile

        f=static.File(requestedfile)
        
        if f.type is None:
            f.type, f.encoding = static.getTypeAndEncoding(requestedfile,
                f.contentTypes,
                f.contentEncodings,
                f.defaultType)        
        
        if f.type:
            ctype=f.type.split(":")[0]
            # Send the headers.
            request.setHeader('content-type', ctype)
            
        if f.encoding:
            request.setHeader('content-encoding', f.encoding)
        # Send the page.               
        if version.major >= 9:
            static.NoRangeStaticProducer(request,f.openForReading()).start()
        else:
            static.FileTransfer(f.openForReading(), f.getFileSize(), request)
        return server.NOT_DONE_YET
    
    def render_POST(self, request):
        if request.path == '/BROWSER':
            data_to_return = MyUtils.launcherData()
            return json.dumps(data_to_return)
        else:
            return {}
        
class ControlFactory(ReconnectingClientFactory):
    protocol = ControlProtocol

    def buildProtocol(self, address):
        self.resetDelay()        
        proto = ReconnectingClientFactory.buildProtocol(self, address)
        return proto

            
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
                self.handler.process(i[0])
        
    def off_if_timeout(self,initial_time):
        if datetime.datetime.now()>(initial_time+ datetime.timedelta(seconds=int(Configs.RootConfigs['offtimeout'] ))):
            Actions.switch_off()