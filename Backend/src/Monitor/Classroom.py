##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:    Classroom.py
# Purpose:     Data of the classroom pcs and its interface
# Language:    Python 2.5
# Date:        21-Jan-2010.
# Ver:        27-Jan-2010.
# Author:    José L.  Redrejo Rodríguez
# Copyright:    2009-2010 - José L. Redrejo Rodríguez       <jredrejo @nospam@ debian.org>
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
import datetime

class Classroom():
    """Classroom data management
    """
    def __init__(self,refreshInterval):    
        """Initialize classroom data
        refreshInterval is the time (in seconds)
       for a host or logged pc to be removed from the teacher list 
        """  
        #List of logged users
        #Information:
        #ip,hostname,classname,ltsp_client,position,visible,internetEnabled,
        #loginname,username,mouseEnabled,messagesEnabled,photo,
        self.LoggedUsers={}
        # Hosts with sirvecole running as root
        #Information: 
        #  IP, hostname,classname,ltsp_client,position,visible,internetEnabled,printerShared
        self.Hosts={}
        
        #Dictionary with the commands the clients must execute 
        #Every dictionary entry contains a list with the commands such client must execute
        #Information: 
        #command,command_args      
        self.CommandStack={}
        
        self.interval=refreshInterval

    def existUser(self,key):
        """Check if a logged user has already been added to the classroom"""
        return self.LoggedUsers.has_key(key)
    
    def existPC(self, ip):
        """Check if a pc has already been added to the classroom"""
        return self.Hosts.has_key(ip)
    
    def addHost(self, login,hostname,hostip,mac,ltsp=False,classname='',internetEnabled=True,printerShared=False):
        """Add a pc to the classroom"""
        if not self.Hosts.has_key(hostip):
            self.Hosts[hostip]=[login,hostname,hostip,mac,ltsp,classname,internetEnabled,printerShared,datetime.datetime.now() ]
            #intialize list of commands for this client
            self.CommandStack[hostip]=[]
    
    
    def addUser(self,login, hostname,hostip,ltsp=False,classname='',username='',ipLTSP='',internetEnabled=True,mouseEnabled=True,printerShared=False,messagesEnabled=False,photo=False):
        """Add a logged user to the classroom"""
        key=login+'@'+hostip
        if not self.LoggedUsers.has_key(key):
            self.LoggedUsers[key]=[login,hostname,hostip,ltsp,classname,username,ipLTSP,internetEnabled,mouseEnabled,printerShared,messagesEnabled,photo,datetime.datetime.now() ]
            #intialize list of commands for this client
            self.CommandStack[key]=[]    
    
    def removeUser(self,key):
        """Remove a logout user from the classroom data"""
        if self.LoggedUsers.has_key(key):
            self.LoggedUsers.pop(key)
            self.CommandStack.pop(key)
            
    def removeHost(self,hostip):
        """Remove a disconnected pc from the classroom data"""
        if self.Hosts.has_key(hostip):
            self.Hosts.pop(hostip)
            self.CommandStack.pop(hostip)
            
    def addCommand(self,key,command,args=[]):
        """Add a command to be executed by a pc or an user.
        Commands without arguments:
                bigbrother
                projector
                enableInternet
                disableInternet
                enableMouse
                disableMouse
                sharePrinter
                unsharePrinter
                enableMessages
                disableMessages
                wakeup
                sleep
        Commands with arguments:
                broadcast ( "file:///url del archivo", or "dvd")
                sendmessage ("text")
                sendfile ("file:///url del archivo")
                startapplication ("command")
                launchweb ("url")
        
        """
        self.CommandStack[key].append((command,args))
        
    def getCommands(self,key):
        """Returns the list of commands to be executed by an user or pc
        and remove them from the list"""
        commands=self.CommandStack[key]
        self.CommandStack[key]=[]
        return commands

    def showCommands(self,key):
        """Returns the list of commands to be executed by an user or pc
        but keep them in the list"""
        commands=self.CommandStack[key]
        return commands
        
        
    def hasCommands(self,key):
        """Returns True if there are commands to be executed by an user or pc"""        
        return (self.CommandStack[key]!=[])      
        
    def updateHostTimeStamp(self,hostip):
        """Updates the last time the host contacted the teacher"""
        self._updateTimeStamp(self.Hosts,hostip)
        
    def updateUserTimeStamp(self,key):
        """Updated the last time the logged user contacted the teacher"""
        self._updateTimeStamp(self.LoggedUsers,key)
        
    def _updateTimeStamp(self,dict,key):
        """Puts a timestamp in the last column of the list stored in the key"""
        timeIndex=len(dict[key])-1
        dict[key][timeIndex]=datetime.datetime.now()        
        
    def UpdateLists(self):   
        from twisted.internet import reactor        
        """Remove the users or hosts that haven't contacted the teacher during
        the (seconds) interval"""

        for i in self.LoggedUsers.keys():
            if self._checkInterval(self.LoggedUsers[i],self.interval):
                self.removeUser(i)
                
        for i in self.Hosts.keys():
            if self._checkInterval(self.Hosts[i],self.interval):
                self.removeHost(i)
                
        reactor.callLater(self.interval, self.UpdateLists)

                
    def _checkInterval(self,data,interval):
        """check if current time has passed data timestamp + 2* interval (in seconds)"""         
        timeIndex=len(data)-1
        timestamp=data[timeIndex]
        return (datetime.datetime.now()>timestamp + datetime.timedelta(seconds=2*interval))
        