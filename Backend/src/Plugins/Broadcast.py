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

import subprocess,os,logging
from Utils import MyUtils
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
            
    def transmit(self,url,dvd=False):
        self.stop()
        self.url=url
        self.dvd=dvd
        command=["vlc","--no-ipv6"]      
        if dvd:
            command+=["dvdsimple:///dev/dvd"]
        else:
            command+=[url]
        command +=["--sout"]
        command +=["#transcode{vcodec=WMV2,vb=512,scale=1,acodec=mpga,ab=32,channels=1}:duplicate{dst=std{access=udp,mux=ts,dst=239.255.255.0:"+ self.port + "}}"]
        command +=["--ttl","5","--audio-desync","1100","--volume", "1024" ]

        try:
            self.procTx = MyPP(self.stop,self.started,self.ended)
            reactor.spawnProcess(self.procTx , "vlc",command,env=os.environ)
            self.procRx=subprocess.Popen(['vlc','--udp-caching','5000','udp://@239.255.255.0:'+ self.port])  
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
            
    def receive(self):
        self.destroyProcess(self.procRx)                
        ltspaudio=' '
        if MyUtils.isLTSP()!='':
            ltspaudio=' PULSE_SERVER=127.0.0.1:4713 ESPEAKER=127.0.0.1:16001 '
                  
        command=ltspaudio 
        if os.path.isfile('/usr/bin/cvlc'):
            command +=  '/usr/bin/cvlc '
        else:
            command +='vlc ' 
        command +=  '--video-on-top --skip-frames --udp-caching 5000  -f  udp://@239.255.255.0:'
        command += self.port 
        self.procRx=MyUtils.launchAsNobody(command)
            
    def stop(self):
        self.destroyProcess(self.procRx)
        self.destroyProcess(self.procTx,True)
        subprocess.Popen(['killall','vlc'])  
                  
    def getData(self):
        return self.port
    
    def destroyProcess(self,proc,shell=False):
        #pdb.set_trace()
        if proc != None:
            try:
            #proc.terminate(): not available in python 2.5    
                if shell:
                    pid=proc.transport.pid
                else:           
                    pid=proc.pid
                
                os.kill(pid, SIGKILL)

            except:
                pass  
    
    def add_callback(self, sig_name, callback):
        self._callbacks[sig_name].append(callback)
 
    
class MyPP(protocol.ProcessProtocol):
    def __init__(self,stop,start,end):
        self.data = ""
        self.stop=stop
        self.start=start
        self.end=end
        
    def errReceived(self, data):
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
    
