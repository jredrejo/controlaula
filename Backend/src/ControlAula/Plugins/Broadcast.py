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
                command+=[" vcdx://" + device]
            else:
                return mount_point
        else:
            command+=[str(url)]
            
        command +=["--sout"]
        #command +=["'#transcode{vcodec=WMV2,vb=512,scale=1,acodec=mpga,ab=32,channels=1}:duplicate{dst=std{access=udp,mux=ts,dst=239.255.255.0:"+ self.port + "}}'"]

        command +=["udp:239.255.255.0:" + self.port]
        command +=["--sout-all","--ttl","5","--audio-desync","1100","--volume", "1024" ]

        try:
            self.procTx = MyPP(self.stop,self.started,self.ended)
            reactor.spawnProcess(self.procTx , 'vlc',command,env=os.environ) 
            logging.getLogger().debug(str(command))
        except:
            logging.getLogger().error('vlc is not working in this system')
            
        return True
    
    def started(self):
        if not self.broadcasting:
            self.broadcasting=True
            
            self.procRx=subprocess.Popen(['vlc','--udp-caching','5000','udp://@239.255.255.0:'+ self.port]) 
            for cb in self._callbacks['started']:            
                cb(self.url,self.dvd)
            
    def ended(self):
        self.stop()
        for cb in self._callbacks['ended']:            
            cb()     
        self.broadcasting=False   
        self.clean_callbacks() 
            
    def receive(self):
        self.destroyProcess(self.procRx) 
        NetworkUtils.cleanRoutes()              
        ltspaudio=' '
        if MyUtils.isLTSP()!='':
            ltspaudio=' PULSE_SERVER=127.0.0.1:4713 ESPEAKER=127.0.0.1:16001 '
                  
        command=ltspaudio 
        #command +='vlc -I dummy ' 
        #command +=  '--video-on-top --skip-frames --udp-caching 5000  -f  udp://@239.255.255.0:'
        command +='ffplay -fs -fast  udp://@239.255.255.0:'
        command += self.port 
        NetworkUtils.addRoute('239.255.255.0')
        self.procRx=MyUtils.launchAsNobody(command)
            
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
        self.stop=stop
        self.start=start
        self.end=end
        
    def errReceived(self, data):
        print data
        if  data.find('nothing to play')>-1 or data.find('cannot open source:')>-1:
            self.stop()
            return False        
        else:
            if data.find('VLC media player')>-1:
                self.start()
        
    def processExited(self, reason):
        self.end()
        
    def processEnded(self, reason):
        self.end()
    
