##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:    TeacherServer.py
# Purpose:     XML-RPC server for the teacher to communicate with the students
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
from twisted.web import xmlrpc
from twisted.internet import defer


class RPCServer(xmlrpc.XMLRPC):
    """Object used to communicate students pcs with teacher pc
    """
    def __init__(self):
        xmlrpc.XMLRPC.__init__(self)
        self.classroom=None
            

        
    def xmlrpc_hostPing(self, login,hostip):
        """Return true to the client if he must sends its initial data.
        executing addUser or addHost"""
        if login=='root':
            key=hostip
        else:
            key =login+'@'+hostip

        if not self.classroom.existUser(key):
            return 'new' #addUser or addHost must be called by the student
        else:
            self.classroom.updateUserTimeStamp(key)
            if self.classroom.hasCommands(key):
                return 'commands' #getCommands must be called by the student        
        #return if the new host has to send its data
        return False
            
    
    def xmlrpc_addUser(self,login, hostname,hostip,ltsp=False,classname='',username='',ipLTSP='',internetEnabled=True,mouseEnabled=True,printerShared=False,messagesEnabled=False,photo=False):
        self.classroom.addUser(login, hostname,hostip,ltsp,classname,username,ipLTSP,internetEnabled,mouseEnabled,printerShared,messagesEnabled,photo)
        return True
    
    def xmlrpc_addHost(self, login,hostname,hostip,mac,ltsp=False,classname='',internetEnabled=True,printerShared=False):
        self.classroom.addHost(login,hostname,hostip,mac,ltsp,classname,internetEnabled,printerShared)
        return True
    
    def xmlrpc_getCommands(self, login,hostip):
        """Return the list of commands to be executed by the client"""
        if login=='root':
            key=hostip
        else:
            key =login+'@'+hostip    
            
        return self.classroom.getCommands(key)
    
    
    
    ###########################
    # XML-RPC functions to be used while developping or testing
    # the application. 
    #
    # For security reasons, they must be disabled for the 
    # final app to be used in production:
    #
    ##########################
    
    def xmlrpc_showCommands(self, login,hostip):
        """Return the list of commands to be executed by the client"""
        if login=='root':
            key=hostip
        else:
            key =login+'@'+hostip    
            
        return self.classroom.showCommands(key)
        
    def xmlrpc_echo(self, *args):
        """Return all passed args.
        Only to be used with test purposes"""
        print args
        return args

    def xmlrpc_hello(self):
        """Return 'hello, world'.
        Only to be used with test purposes"""
        return 'hello, world!'
            
    def xmlrpc_Hosts(self):
        """Return the list of the detected hosts
        Only to be used with test purposes"""
        return self.classroom.Hosts
    
    def xmlrpc_Users(self):
        """Return the list of the detected hosts
        Only to be used with test purposes"""
        return self.classroom.LoggedUsers
    
    def xmlrpc_Commands(self):
        """Return the list of the remaining commands
        Only to be used with test purposes"""
        return self.classroom.CommandStack
    
    def xmlrpc_addCommand(self,key,command,args=[]):
        """Add a new command to the list of commands for the key
        Only to be used with test purposes"""        
        self.classroom.addCommand(key,command,args)
        return ""
               
                
    def xmlrpc_deferCommand(self,hostip,login):
        """
        Return a deferred object with the command 
        and args if the client must do
        something, or an error if it doesn't need it
        Show how xmlrpc methods can return Deferred."""
        return defer.succeed(("hello","world"))
#        return defer.fail(12)


