##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:     VNC.py
# Purpose:     Module to manage VNC server and client
# Language:    Python 2.5
# Date:        22-Dic-2009.
# Ver.:        4-Feb-2010.
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

import subprocess,os,signal,logging
from Utils import MyUtils,NetworkUtils

class VNC(object):
    '''
    It needs x11vnc to work on Linux
    '''

    

    def __init__(self,readonly=True,readpasswd='',writepasswd=''):
        '''
        Parameters:
        readonly=True if the server won't allow keyboard and mouse control
        readpasswd= passwd to use when not controlling keyboard and mouse
        writepasswd= passwd to use when controlling keyboard and mouse
        '''
        if readpasswd=='':
            self.readPasswd=MyUtils.generateUUID()
        else:
            self.readPasswd=readpasswd
            
        if writepasswd=='':
            self.writePasswd=MyUtils.generateUUID()
        else:
            self.writePasswd=writepasswd
            
        if MyUtils.isLTSP()=='':
            self.port=str(NetworkUtils.getUsableTCPPort('127.0.0.1',5900))
        else:
            add=MyUtils.isLTSP().split('.')[3]
            self.port=str(5900 + int(add))
            
        self.readonly=readonly
        
        self.procServer=None
    
    
    def __del__(self):
        self.stop()
            
    def startServer(self):
        if self.readonly:
            try:
                self.procServer=subprocess.Popen(['x11vnc', '-shared', '-forever', '-noncache', '-passwd',  self.writePasswd, '-viewpasswd', self.readPasswd,'-rfbport',self.port])
            except:
                logging.getLogger().error('x11vnc is not working in this system')
                
    def startROViewer(self,target):
        display=MyUtils.getXtty()
        passwd=''
        command='su -c \"' + display + ' xvncviewer -UseLocalCursor=0 -LowColourLevel=1 -ViewOnly -MenuKey Super_R  -Shared  -Fullscreen -passwd '
        command += passwd 
        command += ' ' + target + '\" nobody'
        self.procViewer=subprocess.Popen(command, stdout=subprocess.PIPE,shell=True)
            
    def stop(self):

        try:
            #self.procServer.terminate(): not available in python 2.5
            pid=self.procServer.pid
            os.kill(pid, signal.SIGTERM)
        except:
            pass        
    def getData(self):
        return (self.readPasswd,self.writePasswd,self.port)
    
 
    
    
    
    
    
    
    
    
        