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
# This modules needs x11vnc, xvncviewer and scrot to work
##############################################################################

import subprocess,os,logging,tempfile
from ControlAula.Utils import MyUtils,NetworkUtils,crippled_des
from signal import  SIGTERM,SIGKILL

class VNC(object):
    '''
    It needs x11vnc and xvnc4viewer to work on Linux
    '''

    

    def __init__(self,readonly=True,readpasswd='',writepasswd='',clientport=5900):
        '''
        Parameters:
        readonly=True if the server won't allow keyboard and mouse control
        readpasswd= passwd to use when not controlling keyboard and mouse
        writepasswd= passwd to use when controlling keyboard and mouse
        clientport=the port the client has to use to connect to a VNC server
        '''
        if readpasswd=='':
            self.readPasswd=MyUtils.generateUUID()
        else:
            self.readPasswd=readpasswd
            
        if writepasswd=='':
            self.writePasswd=MyUtils.generateUUID()
        else:
            self.writePasswd=writepasswd
            
        self.isLTSP=MyUtils.isLTSP()
            
        if self.isLTSP=='':
            self.port=str(NetworkUtils.getUsableTCPPort('127.0.0.1',5900))
        else:
            d=self.isLTSP.split('.')
            if len(d)<4: #sometimes, it needs two tries :(
                d=self.isLTSP.split('.')
            self.port=str(5900 + int(d[3]))
            
        self.readonly=readonly
        
        self.procServer=None
        self.clientport=clientport
        self.myteacher=None
        self.mylogin=MyUtils.getLoginName()
        self.myIP=''
        self.activeBB=False
        
    
    
    def __del__(self):
        self.stop()
            
    def startServer(self):      
        try:
            if self.procServer==None:
                if self.readonly:
                    self.procServer=subprocess.Popen(['x11vnc', '-shared', '-forever', '-noncache', '-passwd',  self.writePasswd, '-viewpasswd', self.readPasswd,'-rfbport',self.port])
                else:
                    if self.isLTSP=='':
                        self.procServer=subprocess.Popen(['x11vnc',  '-forever','-ncache','10', '-passwd',  self.writePasswd])                       
                    else:
                        self.procServer=subprocess.Popen(['x11vnc', '-forever', '-ncache','10', '-noshm', '-rfbport', self.port, '-passwd',  self.writePasswd])
        except:
            logging.getLogger().error('x11vnc is not working in this system')
            
        if not self.readonly:
            self.screenshot()
 
    def screenshot(self):
        from twisted.internet import reactor
        import xmlrpclib
        screenshot=os.path.join( MyUtils.getHomeUser(),'.controlaula/vnc.png')
        screenshot_thumb=os.path.join( MyUtils.getHomeUser(),'.controlaula/vnc-thumb.png')
        subprocess.Popen(['scrot','-t','25',screenshot])
        try:
            f = xmlrpclib.Binary(open(screenshot_thumb, 'rb').read())
            self.myteacher.screenshot(self.mylogin,self.myIP,f)         
        except:
            logging.getLogger().error('The user %s could not send its photo' % (self.mylogin))   
        if self.activeBB:     
            reactor.callLater(5, self.screenshot)
                
    def startROViewer(self,target):

        passwd=tempfile.mkstemp()[1]
        self.createVNCPassword(self.readPasswd, passwd)
        command='xvncviewer -UseLocalCursor=0 -LowColourLevel=1 -ViewOnly -MenuKey Super_R  -Shared  -Fullscreen -passwd '
        command += passwd 
        command += ' ' + target +':' + self.clientport
        self.procViewer=MyUtils.launchAsNobody(command)      
        
    def startViewer(self,target,ltsp,ip):
        port=5900
        if ltsp:
            d=ip.split('.')
            port=str(5900 + int(d[3]))
            ip='127.0.0.1'
                        
        passwd=tempfile.mkstemp()[1]
        self.createVNCPassword(self.writePasswd , passwd)

        command=['xvncviewer','-UseLocalCursor','0','-LowColourLevel','1',' -Shared']
        command +=['-passwd',passwd   ]
        command +=[ip+':'+str(port),'-name',target]    
        self.procViewer=subprocess.Popen(command)
          
                  
    def stop(self):

        try:
            #self.procServer.terminate(): not available in python 2.5
            pid=self.procServer.pid
            self.procServer=None
            os.kill(pid, SIGKILL)            
        except:
            pass        
        subprocess.Popen(['killall','-9','x11vnc'])
        subprocess.Popen(['killall','-9','xvncviewer'])
        subprocess.Popen(['killall','-9','xvnc4viewer'])

            
    def getData(self):
        return (self.readPasswd,self.writePasswd,self.port)
    
 
    
    
    def createVNCPassword(self, passwd,file):
        """
        createVNCPassword("micasa","/tmp/vnc")
        """
        
        #
        # We use a fixed key to store passwords, since we assume that our local
        # file system is secure but nonetheless don't want to store passwords
        # as plaintext.
        #
        
        fixedKey = "\x17Rk\x06#NX\x07"    
    
        pw = (passwd + '\0' * 8)[:8]        #make sure its 8 chars long, zero padded
        des = crippled_des.DesCipher(fixedKey)
        response = des.encrypt(pw)
    
        f = open(file, "w")
        f.write(response)
        f.close()  
        try:  
            os.chown(file,65534,0)
        except:
            pass #it will only work when it's executed by sirvecole
    
    
    
    
        