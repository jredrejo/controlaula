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
#from twisted.internet.utils import getProcessOutput
import os,logging,subprocess
from Utils import MyUtils

def setSound(value):
    '''value must be mute or unmute'''
    d=getProcessValue('amixer', ['-c','0','--','sset','Master',value])
    #'amixer -c 0 -- sset Master ' + value
    
    
def disableKeyboardAndMouse():    
    modmap=''
    for n in range(8,256):
        modmap =modmap + 'keycode ' + str(n) + ' = NoSymbol\n'
        


    modmap= modmap + clearKeys()
    mapfile=open(os.path.join(MyUtils.getHomeUser(),'.null_modmap'),'wb'   )
    mapfile.write(modmap)
    mapfile.close()

    try:
        os.remove(os.path.join(MyUtils.getHomeUser(),'.current_modmap'))
    except:
        pass

    #d=getProcessOutput('xmodmap',['-pke',MyUtils.getHomeUser()])
    #d.addCallbacks(disablingkeyboard,error_back)
    #return d
    current= subprocess.Popen(['xmodmap', '-pke',MyUtils.getHomeUser()], stdout=subprocess.PIPE).communicate()[0]
    disablingkeyboard( current)

def error_back(result):
    logging.getLogger().error('Error loading modmap: %s' % (result.getErrorMessage()))
    return 
    

def clearKeys():
    clearKeys= 'clear Shift\n'
    clearKeys += 'clear Lock\n'
    clearKeys += 'clear Control\n'
    clearKeys += 'clear Mod1\n'
    clearKeys += 'clear Mod2\n'
    clearKeys += 'clear Mod3\n'
    clearKeys += 'clear Mod4\n'                
    clearKeys += 'clear Mod5\n'
    return clearKeys    
    
def disablingkeyboard( result):
    modmap=result + clearKeys()
    modmap +='add    Shift   = Shift_L Shift_R\n'
    modmap +='add    Lock    = Caps_Lock\n'
    modmap +='add    Control = Control_L Control_R\n'
    modmap +='add    Mod1    = Alt_L 0x007D 0x009C\n'
    modmap +='add    Mod2    = Num_Lock\n'
    modmap +='add    Mod4    = 0x007F 0x0080\n'
    modmap +='add    Mod5    = Mode_switch ISO_Level3_Shift ISO_Level3_Shift\n'
    
    mapfile=open(os.path.join(MyUtils.getHomeUser(),'.current_modmap'),'wb'   )
    mapfile.write(modmap)
    mapfile.close()
    
    #d=getProcessValue('xmodmap', [os.path.join(MyUtils.getHomeUser(), 'null_modmap')     ])
    #d.addCallback(removeNullModmap)
    #e=getProcessValue('xmodmap',['-e','"pointer = 9 8 7 6 5 4 3 2 1 "']   )
    
    subprocess.Popen(['xmodmap', os.path.join(MyUtils.getHomeUser(), '.null_modmap') ], stdout=subprocess.PIPE)
    subprocess.Popen(['xmodmap', '-e','pointer = 9 8 7 6 5 4 3 2 1 ' ], stdout=subprocess.PIPE)
    
    try:
        os.remove(os.path.join(MyUtils.getHomeUser(),'.null_modmap'))
    except:
        pass    
    
    
def enableKeyboardAndMouse():        

    try:
        os.remove(os.path.join(MyUtils.getHomeUser(),'.null_modmap'))
    except:
        pass    
    subprocess.Popen(['xmodmap', '-e','pointer = default ' ], stdout=subprocess.PIPE)
    current=os.path.join(MyUtils.getHomeUser(),'.current_modmap')
    if os.path.exists( current    ):
        subprocess.Popen(['xmodmap', current ], stdout=subprocess.PIPE)

    
    
def removeNullModmap(exitcode):
    if exitcode==1:
        return
    try:
        os.remove(os.path.join(MyUtils.getHomeUser(),'.null_modmap'))
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

        subprocess.Popen(['wakeonlan',next ])
        subprocess.Popen(['wakeonlan','-i','192.168.0.255',next ])           
        return None
    loop = LoopingCall(sendNext)
    loop.start(throttle)
    return d
