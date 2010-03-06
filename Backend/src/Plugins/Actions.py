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
# HMIServer is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
# You should have received a copy of the GNU General Public License
# along with ControlAula. If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

from twisted.internet.utils import getProcessValue
import subprocess
from Xlib import X

def setSound(value):
    '''value must be mute or unmute'''
    d=getProcessValue('amixer', ['-c','0','--','sset','Master',value])
    #'amixer -c 0 -- sset Master ' + value
    
def disableKeyboardAndMouse(display): 

    root = display.screen().root
    root.grab_pointer(1, X.PointerMotionMask|X.ButtonReleaseMask|X.ButtonPressMask,  
                X.GrabModeAsync, X.GrabModeAsync, X.NONE, X.NONE, X.CurrentTime) 
    root.grab_keyboard(1,X.GrabModeAsync, X.GrabModeAsync,X.CurrentTime)
    
        
def enableKeyboardAndMouse(display):
    display.ungrab_keyboard(X.CurrentTime)
    display.ungrab_pointer(X.CurrentTime)
    display.flush()       
  
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

        subprocess.Popen(['wakeonlan',next ])
        subprocess.Popen(['wakeonlan','-i','192.168.0.255',next ])           
        return None
    loop = LoopingCall(sendNext)
    loop.start(throttle)
    return d
