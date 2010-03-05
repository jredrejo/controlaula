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
from signal import  SIGTERM
from os import kill

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

    def __del__(self):
        self.stop()
            
    def transmit(self,url,dvd=False):
        self.stop()
        
        command='vlc --no-ipv6 '
        if dvd:
            command += 'dvdsimple:///dev/dvd'   
        else:
            command +='\"' + url + '\"'
        
        command +=" --sout-keep --sout '#standard{access=udp,mux=ts,dst=239.255.255.0:"+ self.port + "}'"
        command +=" --ttl 5 --sout-all --audio-desync 1100 --volume 1024"

        try:
            self.procTx=subprocess.Popen(command, stdout=subprocess.PIPE,shell=True)
            self.procRx=subprocess.Popen(['vlc','udp://@239.255.255.0:'+ self.port])  
            logging.getLogger().debug(str(command))
        except:
            logging.getLogger().error('vlc is not working in this system')
                
    def receive(self):
        self.destroyProcess(self.procRx)        
        display,xauth=MyUtils.getXtty()
        
        ltspaudio=' '
        if MyUtils.isLTSP()!='':
            ltspaudio=' PULSE_SERVER=127.0.0.1:4713 ESPEAKER=127.0.0.1:16001 '
                  
        command='su -c \"' + xauth + ' ' + display + ltspaudio 
        command +=  'vlc --video-on-top --skip-frames  -f  udp://@239.255.255.0:'
        command += self.port + '\" nobody'
        
        logging.getLogger().debug(command)
        self.procRx=subprocess.Popen(command, stdout=subprocess.PIPE,shell=True)
            
    def stop(self):
        self.destroyProcess(self.procRx)
        self.destroyProcess(self.procTx)
           
    def getData(self):
        return self.port
    
    def destroyProcess(self,proc):

        if proc!=None:
            try:
            #proc.terminate(): not available in python 2.5
                pid=proc.pid
                kill(pid, SIGTERM)
            except:
                pass  
    
    
    
        