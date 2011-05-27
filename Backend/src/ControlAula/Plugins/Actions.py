##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:     Actions.py
# Purpose:     Several  simple actions to be executed by ControlAula
# Language:    Python 2.5
# Date:        17-Feb-2010.
# Ver:        17-Feb-2010.
# Author:    José L. Redrejo Rodríguez
# Copyright:   2010 - José L. Redrejo Rodríguez    <jredrejo @nospam@ debian.org>
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

from twisted.internet.utils import getProcessValue
from ControlAula.Utils import NetworkUtils,MyUtils
import subprocess
from Xlib import X
from Xlib.display import Display
from os import remove
from glob import glob
used_display=None

def setSound(value):
    '''value must be mute or unmute'''
    d=getProcessValue('amixer', ['-c','0','--','sset','Master',value])
    #'amixer -c 0 -- sset Master ' + value
    
def disableKeyboardAndMouse(newAction=True):   
    global used_display
    
    if newAction:
        for i in glob('/tmp/*.controlaula'):
            remove( i)        
    try:
        disp=MyUtils.getXtty()[0]     
        if used_display is None:
            used_display=Display(disp)
        root = used_display.screen().root
        root.grab_pointer(1, X.PointerMotionMask|X.ButtonReleaseMask|X.ButtonPressMask,  
                    X.GrabModeAsync, X.GrabModeAsync, X.NONE, X.NONE, X.CurrentTime) 
        root.grab_keyboard(1,X.GrabModeAsync, X.GrabModeAsync,X.CurrentTime)                    
    except:
        pass           

def enableKeyboardAndMouse():
    global used_display
    try:
        used_display.ungrab_keyboard(X.CurrentTime)
        used_display.ungrab_pointer(X.CurrentTime)
        used_display.flush()       
        used_display=None 
    except:
        pass
  
def sendWOLBurst(macs,throttle):    
    from twisted.internet.task import LoopingCall    
    from twisted.internet import defer    
    if not macs:
        return defer.succeed(None)
    d = defer.Deferred()
    work = list(macs)
    def sendNext():
        if not work:
            loop.stop()
            d.callback(None)
            return defer.succeed(None)
        next = work.pop(0)

        #subprocess.Popen(['wakeonlan',next ])
        #subprocess.Popen(['wakeonlan','-i','192.168.0.255',next ])
        NetworkUtils.startup(next)
                   
        return None
    loop = LoopingCall(sendNext)
    loop.start(throttle)
    return d

def switch_off():
    from twisted.internet import reactor
    import os.path
    if os.path.exists('/usr/sbin/ethtool'):
        try:
            subprocess.call(['ethtool','-s','eth0','wol','g'])
        except:
            pass #this will fail if eth0 does not exist
                            
    if MyUtils.isLTSP()=='':                      
        subprocess.call(['killall','-9','x-session-manager'])            
    else:
        subprocess.call(['poweroff','-w'])
        try:
            server,socket = MyUtils.getLDMinfo()
            if server!='':
                subprocess.call(['ssh','-O','exit','-S',socket,server])           
        except:
            pass            

    reactor.callLater(1,die)    
    
def die():
    if MyUtils.isLTSP()=='':
        subprocess.Popen(['poweroff','-hp'])
    else:
        subprocess.Popen(['poweroff','-fp'])    