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
# ControlAula is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
# You should have received a copy of the GNU General Public License
# along with ControlAula. If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
from twisted.web import xmlrpc
from twisted.internet import defer
import User,Host
from ControlAula.Utils import NetworkUtils,Configs
import os,time
class RPCServer(xmlrpc.XMLRPC):
    """Object used to communicate students pcs with teacher pc
    """
    def __init__(self):
        xmlrpc.XMLRPC.__init__(self)
        self.classroom=None
        self.externalIP=NetworkUtils.get_ip_inet_address()
        if self.externalIP=='':
            self.externalIP=NetworkUtils.get_ip_inet_address('192.168.0.254')
        self.hostname=NetworkUtils.getHostName()
        
    def xmlrpc_hostPing(self, login,hostip):
        """Return true to the client if he must sends its initial data.
        executing addUser or addHost"""
        if login=='root':
            key=hostip
            if not self.classroom.existPC(key):
                return 'new'
            else:
                self.classroom.updateHostTimeStamp(key)
        else:
            key =login+'@'+hostip
            if not self.classroom.existUser(key):
                return 'new'
            else:
                self.classroom.updateUserTimeStamp(key)
                
        if self.classroom.hasCommands(key):
            return 'commands' #getCommands must be called by the student        
        #return if the new host has to send its data
        return False
            
    
    def xmlrpc_addUser(self,login, hostname,hostip,ltsp=False,classname='',username='',ipLTSP='',internetEnabled=True,mouseEnabled=True,soundEnabled=True,messagesEnabled=False,photo=''):
        user=User.User(login,hostname,hostip,ltsp,classname,username,ipLTSP,internetEnabled,mouseEnabled,soundEnabled,messagesEnabled,photo)
        self.classroom.addUser(user)
        return True
   
    def xmlrpc_addHost(self, login,hostname,hostip,mac,ltsp=False,classname='',internetEnabled=True):
        if self.classroom.Hosts.has_key(hostip):
            return False
        if self.externalIP== hostip and self.hostname==hostname:
            return False #the teacher host is not added to the list
        host=Host.Host(login,hostname,hostip,mac,ltsp,classname,internetEnabled)
        self.classroom.addHost(host)
        return True   
    
    def xmlrpc_removeHost(self, ip):
        if not self.classroom.Hosts.has_key(ip):
            return False
        self.classroom.removeHost(ip)
        return True

    def xmlrpc_removeUser(self, login,ip):
        key=login +'@'+ ip
        if not self.classroom.Users.has_key(key):
            return False
        self.classroom.removeUser(key)
        return True
        
    def xmlrpc_getCommands(self, login,hostip):
        """Return the list of commands to be executed by the client"""
        if login=='root':
            key=hostip
        else:
            key =login+'@'+hostip    
        commands=self.classroom.getCommands(key)    
        return commands
    
    def xmlrpc_screenshot(self,login,hostip, file):
        key =login+'@'+hostip
        if  not self.classroom.LoggedUsers.has_key(key):
            return   "ok"
        datum = file.data
        shotname=login + time.strftime('%Y%m%d%H%M%S',time.localtime()) + '.png'
        try:
            os.remove(os.path.join(Configs.IMAGES_DIR + '/screenshots',self.classroom.LoggedUsers[key].shotname))
        except:
            pass
        self.classroom.LoggedUsers[key].shotname=shotname
        thefacename=os.path.join(Configs.IMAGES_DIR + '/screenshots',shotname)
        
        try:
            theface = open(thefacename, "wb")
            theface.write(datum)
            theface.close()
        except:
            pass
        #os.spawnl(os.P_NOWAIT, '/usr/bin/display', '/tmp/gnu.jpg')   
        return "ok"
    
    def xmlrpc_facepng(self,login,hostip, file):
        key =login+'@'+hostip
        datum = file.data
        thefacename=os.path.join(Configs.IMAGES_DIR,login + '.png')
        try:
            theface = open(thefacename, "wb")
            theface.write(datum)
            theface.close()
            self.classroom.addPhoto('/loginimages/' + login + '.png',key)
        except:
            pass
        #os.spawnl(os.P_NOWAIT, '/usr/bin/display', '/tmp/gnu.jpg')   
        return "ok"    
    
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
        list=[]
        for i in self.classroom.Hosts:
            list.append(i.__str__())
        return list

    def xmlrpc_Desktops(self):
        """Return the list of the classroom structure
        Only to be used with test purposes"""
        list=[]
        for i in self.classroom.Desktops:
            list.append(i.__str__())
        return list
        
    def xmlrpc_Users(self):
        """Return the list of the detected hosts
        Only to be used with test purposes"""
        list=[]
        for i in self.classroom.LoggedUsers:
            list.append(i.__str__())
        return list        
        
    def xmlrpc_Json(self):
        """Return the list of the json structure for the frontend
        Only to be used with test purposes"""

        return self.classroom.getJSONFrontend()
    
    def xmlrpc_connData(self):
        return self.classroom.myVNC.getData() + (self.classroom.broadcast.getData(),)
        
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

    def xmlrpc_getAnswer(self,login,hostip,answer):
        key =login+'@'+hostip 
        deferred_request=self.classroom.LoggedUsers[key].deferred_request
        if  deferred_request is not None:
            deferred_request.write(answer)
            deferred_request.finish()
            self.classroom.LoggedUsers[key].deferred_request=None
        return ""

       
