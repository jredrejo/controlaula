##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:     Broadcast.py
# Purpose:     Module to manage video broadcasting in the client and the server
# Language:    Python 2.5
# Date:        2-Mar-20010.
# Ver.:        3-Mar-2010.
# Copyright:    2009-2010 - José L. Redrejo Rodríguez       <jredrejo @nospam@ debian.org>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
# 
##############################################################################

import subprocess,os,logging,dbus
from ControlAula.Utils import MyUtils,NetworkUtils
from ControlAula.Plugins import Actions
from signal import  SIGKILL
from twisted.internet import protocol
from twisted.internet import reactor

class Vlc(object):
    '''
    It needs vlc (videolan) to work 
    '''

    def __init__(self,bcastport=0):
        '''
        Parameters:
        bcastport=The port use in the video broadcasting
        '''          
        if bcastport==0:
            self.port=str(7000+os.getuid())
        else:
            self.port=bcastport
           
        self.procTx=None
        self.procRx=None
        self.handler=None
        self._callbacks = {'started':[],  'ended':[]}
        self.url=''
        self.dvd=False
        self.broadcasting=False
        self.myIP=NetworkUtils.get_ip_inet_address()
        self.codec_h264=self.is_h264_available()
        
    def is_h264_available(self):
        """ check if encoding with h264 is possible """
        guess=subprocess.Popen(["vlc","-l"],stdout=subprocess.PIPE)
        guess.wait()
        output=guess.communicate()[0]
        return 'x264' in output              
        
    def __del__(self):
        self.stop()
            
    def get_disk_info(self):
        disc_info=('',0,0,'')
        bus = dbus.SystemBus()
        hal_manager_obj = bus.get_object("org.freedesktop.Hal", "/org/freedesktop/Hal/Manager")
        hal_manager_iface = dbus.Interface(hal_manager_obj,"org.freedesktop.Hal.Manager")       
        
        device_names = hal_manager_iface.GetAllDevices()           
        for udi in device_names:

            d_object = bus.get_object('org.freedesktop.Hal',udi)
            d_interface = dbus.Interface(d_object,'org.freedesktop.Hal.Device')
            properties = d_interface.GetAllProperties()
                  
            if  properties.has_key("volume.disc.is_videodvd") :
                disc_info=(properties["block.device"].encode("utf-8"),properties["volume.disc.is_videodvd"],properties["volume.disc.is_vcd"],properties["volume.mount_point"].encode("utf-8"))
                break
            
        return disc_info
                   
    def transmit(self,url,dvd=False):
        self.broadcasting=False
        self.url=url
        self.dvd=dvd
        command=["vlc","--no-ipv6"]   
        if dvd:
            device,isdvd,isvcd,mount_point=self.get_disk_info()
            if device=='':
                return "NODISK"
            elif isdvd==1:
                command+=["dvdsimple://" + device]
            elif isvcd==1:
                command+=["vcdx://" + device]
            else:
                return mount_point
        else:
            command+=[str(url)  ]
            
        command +=["--netsync-master"]    
        if self.codec_h264:
            command +=["--sout","#transcode{vcodec=h264,vb=128,fps=32,scale=1,acodec=mp4a,ab=16,channels=1}:duplicate{dst=rtp{mux=ts,dst=239.255.255.0,port=" + self.port +"}}"]
            command +=["--sout-x264-cabac","--sout-x264-qp=32","--sout-x264-keyint=50"]
        else:
            
            command += [ "--sout","#rtp{dst=239.255.255.0,port=" + self.port + ",mux=ts}"]
           
        try:
            self.procTx = MyPP(self.stop,self.started,self.ended)
            reactor.spawnProcess(self.procTx , 'vlc',command,env=os.environ) 
            
            self.procRx=subprocess.Popen(['vlc','--qt-minimal-view','rtp://@239.255.255.0:'+ self.port]) 
            logging.getLogger().debug(str(command))
        except:
            logging.getLogger().error('vlc is not working in this system')
            
        return True
    
    def started(self):
        if not self.broadcasting:
            self.broadcasting=True
            for cb in self._callbacks['started']:            
                cb(self.url,self.dvd)
            
    def ended(self):
        self.stop()
        for cb in self._callbacks['ended']:            
            cb()     
        self.broadcasting=False   
        self.clean_callbacks() 
            
    def receive(self,encodec=False,teacherIP=''):        
        self.destroyProcess(self.procRx) 
        my_login = MyUtils.getLoginName()
        isLTSP = (MyUtils.isLTSP()!='')
        if my_login == 'root': NetworkUtils.cleanRoutes()              
        command = 'vlc -I dummy ' 
        if isLTSP:
            command +=  ' --no-overlay --vout=xcb_x11 '
        command +=  '--quiet --video-on-top --skip-frames --sout-display-delay=1100  --sub-track=0 --no-overlay '
        
        command +='  -f  rtp://@239.255.255.0:'
        command += self.port 
        logged=MyUtils.logged_user()
        if not isLTSP and my_login != 'root':
            self.procRx=subprocess.Popen(command, stdout=subprocess.PIPE,shell=True)
            MyUtils.launchAs("xset s off",my_login)
        else:    
            if logged !='root':
                self.procRx=MyUtils.launchAs(command, logged)
                MyUtils.launchAs("xset s off",logged)                
            else:        
                self.procRx=MyUtils.launchAsNobody(command)
                  
        MyUtils.dpms_on()        
        Actions.disableKeyboardAndMouse(False)
            
    def stop(self):
        logging.getLogger().debug('vlc stopped')
        try:
            if self.procRx is not None:
                self.destroyProcess(self.procRx)
            if self.procTx is not None:
                self.destroyProcess(self.procTx,True)
            subprocess.Popen(['killall','vlc'])  
        except:
            pass
        
                  
    def getData(self):
        return self.port
    
    def destroyProcess(self,procD,shell=False):
        logging.getLogger().debug('vlc destroyed')
        try:
            #proc.terminate(): not available in python 2.5    
                if shell:
                    pid=procD.transport.pid
                else:           
                    pid=procD.pid
                
                os.kill(pid, SIGKILL)

        except:
            pass  
    
    def add_callback(self, sig_name, callback):
        self._callbacks[sig_name].append(callback)
        
    def clean_callbacks(self):
        self._callbacks = {'started':[],  'ended':[]}
    
class MyPP(protocol.ProcessProtocol):
    def __init__(self,stop,start,end):
        self.data = ""
        self.stop_all=stop
        self.start_viewer=start
        self.end=end
        self.active=False
        
    def errReceived(self, data):
        if self.active:return
        if  data.find('nothing to play')>-1 or data.find('cannot open source:')>-1:
            self.stop_all()
            return False        
        else:
            if  not self.active:
                try:
                    self.active=True
                    reactor.callLater(2.0,self.start_viewer)
                except:
                    pass
        
    def processExited(self, reason):
        self.end()
        
    def processEnded(self, reason):
        self.end()
    
