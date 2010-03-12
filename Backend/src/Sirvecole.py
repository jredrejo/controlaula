#!/usr/bin/env python
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
# Important:    WHEN EDITING THIS FILE, USE TABS TO INDENT - NOT SPACES!
##############################################################################


import signal
import sys
import logging
import subprocess
import os
from ControlAula.Utils import NetworkUtils




LOG_FILENAME= "/var/log/controlaula.log"
HOSTNAME=''

#Interval to check if the hosts are off or users have logout
REFRESH=5

Teachers={}
    
def SigHandler(signum, frame):
    print 'Stopping Sirvecole'

    try:
        reactor.stop()
    except:
        pass
    sys.exit()                                                   


def _add_teacher(self, name, address, port):
    #discard ipv6 entries
    if address.find(":") == -1:
        logging.getLogger().debug('New teacher detected: ' + name)
        if not Teachers.has_key(name):
            Teachers[name]=(address,port)
            MyStudent.newTeacher(name)


def _remove_teacher(self, name, address, port):    
    #discard ipv6 entries
    if address.find(":") == -1:
        if  Teachers.has_key(name):
            logging.getLogger().debug('teacher disappeared: ' + name)
            Teachers.pop(name)
        
        
        
        
if __name__ == '__main__':
    
     
    from twisted.internet import glib2reactor
    glib2reactor.install()  
    
    from twisted.internet import reactor
    
    

    # Initialise the signal handler.
    signal.signal(signal.SIGINT, SigHandler)  
    
    HOSTNAME=NetworkUtils.getHostName()
    


    logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(levelname)-8s %(message)s',
                    datefmt='%a, %d %b %Y %H:%M:%S',
                    filename=LOG_FILENAME)
    
    if os.path.exists('/usr/sbin/ethtool'):
        subprocess.call(['ethtool','-s','eth0','wol','g'])
    ######### Begin the application loop #######

    from ControlAula import ScanTeachers, StudentLoop
    
    try:
        monitor = ScanTeachers.AvahiMonitor()    
        monitor.add_callback('new-service', _add_teacher)
        monitor.add_callback('remove-service',    _remove_teacher)
        monitor.start()

    except Exception, ex:
        error_msg = "Couldn't initialize Avahi monitor: %s" % str(ex)
        logging.getLogger().error("Couldn't initialize Avahi monitor: %s" % str(ex))
        sys.exit()
    
    #PENDING: SI NO EXISTE /nonexistent/.vlc/cache hay que crearlo
    
    MyStudent=StudentLoop.Obey(Teachers,int(REFRESH/2))
    reactor.callWhenRunning(MyStudent.listen)
        
reactor.run()

