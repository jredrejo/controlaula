##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:    Desktop.py
# Purpose:     Model a desktop pc with its user to be sent to the frontend
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
class Desktop(object):
    
    def __init__(self):
        self.hostkey=''
        self.userkey=''
        self.login=''
        self.username=''
        self.hostname='None'
        self.ip=''
        self.ltsp=False
        self.internet=1
        self.sound=1
        self.mouse=1
        self.messages=1
        self.photo=''
        self.mainIP=''


    def __str__(self):
        return str((self.hostkey,self.userkey,self.login,self.username,self.hostname,self.ip,self.ltsp,self.internet,self.sound,self.mouse,self.messages,self.photo))
            
    def putHost(self,host,key):
        '''Place the host pc of this Desktop , where host is a list containing the host data, and key if the 
        key of this host in the Hosts dictionary at Classroom
        
         self.Hosts[hostip]=[login,hostname,hostip,mac,ltsp,classname,internetEnabled,printerShared,datetime.datetime.now() ]
        '''
        self.hostkey=key
        self.hostname=host.hostname
        self.ip=host.ip
        self.mainIP=host.ip
        self.ltsp=host.ltsp
        self.internet=host.internet

    
    
    def putUser(self,user,key):
        '''Place the logged user of this Desktop , where user  is a list containing the user data, and key if the 
        key of this user in the LoggedUsers dictionary at Classroom
        
        self.LoggedUsers[key]=[login,hostname,hostip,ltsp,classname,username,ipLTSP,internetEnabled,
                        mouseEnabled,printerShared,messagesEnabled,photo,datetime.datetime.now() ]
        '''
        self.userkey=key
        self.login=user.login
        self.username=user.username
        self.internet=user.internet
        self.mouse=user.mouse
        self.sound=user.sound
        self.messages=user.messages
        self.photo=user.photo
        if user.ltsp:
            self.mainIP=user.ipLTSP


    def delUser(self):
        '''After the user logouts
        '''
        self.userkey=''
        self.login=''
        self.username=''
        self.photo=''
        
    def getFrontendInfo(self):
        ''' builds the line that must be passed to the frontend for this desktop
       
        '''
        dict={}
        if self.hostkey=='':
            dict['ON']='0'
        else:
            dict['ON']='1'
        dict['mouseEnabled']=str(self.mouse)
        dict['internetEnabled']=str(self.internet)
        dict['messagesEnabled']=str(self.messages)
        dict['printerShared']=str(self.sound)
        dict['photo']=self.photo
        dict['visible']='1'
        dict['loginname']=self.login
        dict['username']=self.username
        dict['PCname']=self.hostname
        
        return dict