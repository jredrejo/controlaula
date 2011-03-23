#!/usr/bin/env python
# -*- coding: utf-8 -*-
##############################################################################
# Project:     Controlaula/Monitor
# Module:     Monitor.py
# Purpose:     Starting module for this daemon
# Language:    Python 2.5
# Date:        15-Jan-2010.
# Ver.:        1-Nov-2010.
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
import logging,logging.handlers
import os
from ControlAula.Utils import NetworkUtils, MyUtils, Configs
from twisted.internet.error import CannotListenError
from twisted.internet.task import LoopingCall
from time import sleep

LOG_FILENAME = Configs.LOG_FILENAME
PORT=8900
#Interval to check if the hosts are off or users have logout
REFRESH=5
    
def SigHandler(signum, frame):
    print 'Stopping Monitor'
    #if service != None:
    try:
        service.unpublish()
        reactor.stop()
    except:
        pass
    if isTeacher:
        MyClass.myVNC.stop()
    sys.exit()       
                                             


def checkActivity():

    def sendNext():

        if not MyUtils.isActive():
            reactor.stop()
            sys.exit()
             
    loop = LoopingCall(sendNext)
    loop.start(5)
    return     
        
class singleinstance(object):
    '''
    singleinstance - : make sure that
                     only a single instance of an application is running.
    '''
                        
    def __init__(self, pidPath):
        '''
        pidPath - full path/filename where pid for running application is to be
                  stored.  Often this is ./var/<pgmname>.pid
        '''
        self.pidPath=pidPath

        if os.path.exists(pidPath):
            pid=open(pidPath, 'r').read().strip()
            try:
                os.kill(int(pid), 0)
                pidRunning = True
            except OSError:
                pidRunning = False

            if pidRunning:
                self.lasterror=True
            else:
                self.lasterror=False
        else:
            self.lasterror=False

        if not self.lasterror:
            # Write my pid into pidFile to keep multiple copies of program from running
            fp=open(pidPath, 'w')
            fp.write(str(os.getpid()))
            fp.close()

    def alreadyrunning(self):
        return self.lasterror

    def __del__(self):
        if not self.lasterror:
            os.unlink(self.pidPath)
                    
        
        
if __name__ == '__main__':   
    
    myapp = singleinstance(os.path.join (Configs.APP_DIR,'controlaula.pid')  )
    if myapp.alreadyrunning():
        sys.exit("Another instance of this program is already running")    
                             
    log_handler = logging.handlers.RotatingFileHandler(Configs.LOG_FILENAME, maxBytes=100000, backupCount=5)
    log_formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',datefmt='%a, %d %b %Y %H:%M:%S')
    log_handler.setFormatter(log_formatter)
    root_logger=logging.getLogger() 
    root_logger.addHandler(log_handler)
    root_logger.level=logging.DEBUG
        
    # Initialise the signal handler.
    signal.signal(signal.SIGINT, SigHandler)  
    
    #Get and save some global variables:        
    isTeacher=MyUtils.userIsTeacher()
    #isTeacher=False#enable for debugging
    USERNAME=MyUtils.getLoginName()
    HOSTNAME=NetworkUtils.getHostName()
    Configs.PORT=NetworkUtils.getUsableTCPPort("localhost",PORT)
    MyUtils.putLauncher( '',Configs.PORT  , isTeacher)
    
    if not isTeacher:        
        from twisted.internet import glib2reactor
        glib2reactor.install()      
    from twisted.internet import reactor    
    
    ######### Begin the application loop #######
    if  isTeacher:        
        logging.getLogger().debug("The user is a teacher")
        from ControlAula import TeacherMainLoop, Classroom
        from ControlAula.Utils  import Publications
        from twisted.web import server
        
        NetworkUtils.getWirelessData()
        if MyUtils.isLTSPServer():
            externalIP=NetworkUtils.get_ip_inet_address(NetworkUtils.ltspGW())
        else:
            externalIP=NetworkUtils.get_ip_inet_address()
        if externalIP=='':
            externalIP=NetworkUtils.get_ip_inet_address('192.168.0.254')
        service=Publications.Publications(port=Configs.PORT,name=USERNAME+'@'+HOSTNAME,text=["ipINET=" + externalIP,"web=" + str( Configs.PORT),"classroomname=" + Configs.RootConfigs['classroomname'] ])
        try: #in case cache are filled with a previous "bad stopped" instance of controlaula
            service.unpublish()
            sleep( 0.1)
        except:
            pass
        
        #Initialize classroom data
        MyClass=Classroom.Classroom(REFRESH)
        
        chat_logger = logging.getLogger('Chat')
        chat_logger.setLevel(logging.INFO)  
        chat_logger.propagate=False
        chat_handler = logging.handlers.TimedRotatingFileHandler(Configs.LOG_CHAT,'D',1)
        chat_handler.suffix = "%Y-%m-%d" 
        chat_formatter = logging.Formatter(fmt='%(asctime)-8s %(message)s',datefmt='%a, %d %b %Y %H:%M:%S')
        chat_handler.setFormatter(chat_formatter)
        chat_logger.addHandler(chat_handler)        
        
        # Start up the web service.     
        AulaRoot = TeacherMainLoop.ControlAulaProtocol() #Resource object
        AulaRoot.PageDir=Configs.WWWPAGES
        AulaRoot.publish_service=service
#        service.publish()
        AulaRoot.teacher.classroom=MyClass        

        AulaSite = server.Site(AulaRoot) #Factory object
        # This is the error message to use if we can't listen on a selected port.
        _ListenMsg = """\n\tFatal Error - cannot listen on port %s.
        \tThis port may already be in use by another program.\n\n"""        
        
        try:
            reactor.listenTCP(Configs.PORT, AulaSite)
            reactor.callWhenRunning(MyClass.UpdateLists)
        except CannotListenError:
            # If we can't use this port, then exit.
            print(_ListenMsg % str(Configs.PORT))
            sys.exit()          
         

    else:         
        logging.getLogger().debug("The user is NOT a teacher")
        from ControlAula import StudentLoop
        
        MyStudent=StudentLoop.Obey(REFRESH)
        reactor.callWhenRunning(MyStudent.listen)
        reactor.callWhenRunning(MyStudent.startScan)    
    
    #begin application loop:
    reactor.callWhenRunning(checkActivity)        
    reactor.run()

