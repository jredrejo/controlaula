##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula/Monitor
# Module:     Monitor.py
# Purpose:     Starting module for this daemon
# Language:    Python 2.5
# Date:        15-Jan-2010.
# Ver.:        27-Jan-2010.
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


import signal,sys,os,logging
from Utils import NetworkUtils, MyUtils
from twisted.internet.error import CannotListenError


USERNAME=''
USERHOME=''
LOG_FILENAME = ''
HOSTNAME=''
PORT=9000
PAGES='/var/www'
#Interval to check if the hosts are off or users have logout
REFRESH=5

Teachers={}
    
def SigHandler(signum, frame):
    print 'Stopping Monitor'
    if service != None:
        try:
            service.unpublish()
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
    
    #############Initialization#############
    
    isTeacher=MyUtils.userIsTeacher()
    isTeacher=False
    
    if not isTeacher:        
        from twisted.internet import glib2reactor
        glib2reactor.install()  
    
    from twisted.internet import reactor
    
    

    # Initialise the signal handler.
    signal.signal(signal.SIGINT, SigHandler)  
    
    USERNAME=MyUtils.getLoginName()
    USERHOME=MyUtils.getHomeUser()
    HOSTNAME=NetworkUtils.getHostName()
    WEBPORT=NetworkUtils.getUsableTCPPort("localhost",PORT)
    LOG_FILENAME=USERHOME + "/.controlaula/controlaula.log"
    if not os.path.isdir(USERHOME + "/.controlaula"):
        os.mkdir(USERHOME + "/.controlaula")
    logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(levelname)-8s %(message)s',
                    datefmt='%a, %d %b %Y %H:%M:%S',
                    filename=LOG_FILENAME)
    
    
    ######### Begin the application loop #######
    
    if  isTeacher:        
        logging.getLogger().debug("The user is a teacher")
        from Monitor import Publications, TeacherMainLoop, Classroom
        from twisted.web import server
        
        service=Publications.Publications(port=WEBPORT,name=USERNAME+'@'+HOSTNAME,text=["ipINET=" + NetworkUtils.get_ip_inet_address(),"web=" + str( WEBPORT) ])
        service.publish()
        #Initialize classroom data
        MyClass=Classroom.Classroom(REFRESH)
        
        # Start up the web service.     
        AulaRoot = TeacherMainLoop.ControlAulaProtocol() #Resource object
        AulaRoot.PageDir=PAGES
        AulaRoot.teacher.classroom=MyClass
        
        AulaSite = server.Site(AulaRoot) #Factory object
        # This is the error message to use if we can't listen on a selected port.
        _ListenMsg = """\n\tFatal Error - cannot listen on port %s.
        \tThis port may already be in use by another program.\n\n"""

        print WEBPORT
        try:
            reactor.listenTCP(WEBPORT, AulaSite)
            reactor.callWhenRunning(MyClass.UpdateLists)
        except CannotListenError:
            # If we can't use this port, then exit.
            print(_ListenMsg % str(WEBPORT))
            sys.exit()              

    else:         
        logging.getLogger().debug("The user is NOT a teacher")
        from Monitor import ScanTeachers, StudentLoop
        
        try:
            monitor = ScanTeachers.AvahiMonitor()    
            monitor.add_callback('new-service', _add_teacher)
            monitor.add_callback('remove-service',    _remove_teacher)
            monitor.start()
    
        except Exception, ex:
            error_msg = "Couldn't initialize Avahi monitor: %s" % str(ex)
            logging.getLogger().error("Couldn't initialize Avahi monitor: %s" % str(ex))
            sys.exit()
        
        MyStudent=StudentLoop.Obey(Teachers,int(REFRESH/2))
        reactor.callWhenRunning(MyStudent.listen)
        
reactor.run()

