#!/usr/bin/python
# -*- coding: utf-8 -*-
##############################################################################
# Project:     Controlaula/Sirvecole
# Module:     Sirvecole.py
# Purpose:     Starting module for this daemon
# Language:    Python 2.5
# Date:        15-Jan-2010.
# Ver.:        2-Feb-2010.
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

try:
    import psyco
    psyco.full()
except ImportError:
    pass
import signal
import sys
import logging
import subprocess
import os
from ControlAula.Utils import NetworkUtils
from twisted.application import service

LOG_FILENAME= "/var/log/controlaula.log"
HOSTNAME=''

#Interval to check if the hosts are off or users have logout
REFRESH=5

def SigHandler(signum, frame):
    print 'Stopping Sirvecole'

    try:
        reactor.stop()
    except:
        pass
    sys.exit()                                                   
       
def prepareBroadcast():        
    NetworkUtils.cleanRoutes()
    ltspGW=NetworkUtils.ltspGW()
    if ltspGW!='0':
        NetworkUtils.addRoute('239.255.255.0', ltspGW)
    else:
        reactor.callLater(10, prepareBroadcast)
        
 
from twisted.internet import reactor



# Initialise the signal handler.
signal.signal(signal.SIGINT, SigHandler)  

HOSTNAME=NetworkUtils.getHostName()



logging.basicConfig(level=logging.DEBUG,
                format='%(asctime)s %(levelname)-8s %(message)s',
                datefmt='%a, %d %b %Y %H:%M:%S',
                filename=LOG_FILENAME)

######### Begin the application loop #######

from ControlAula import StudentLoop

#vlc cache for the nobody user:
if not os.path.isdir('/nonexistent'):
    try:
        os.makedirs('/nonexistent')
    except:
        pass
    try:
        os.chown('/nonexistent',65534, 0)
    except:
        pass

MyStudent=StudentLoop.Obey(REFRESH)
reactor.callWhenRunning(MyStudent.listen)
reactor.callWhenRunning(MyStudent.startScan)

reactor.callWhenRunning(prepareBroadcast)

#application = service.Application('controlaula',uid=0,gid=0)
reactor.run()