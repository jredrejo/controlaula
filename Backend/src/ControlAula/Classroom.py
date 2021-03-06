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
# ControlAula is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
# You should have received a copy of the GNU General Public License
# along with ControlAula. If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
import datetime,logging
import Desktop
from ControlAula.Utils import  Configs, MyUtils,NetworkUtils
from ControlAula.Plugins import VNC,Broadcast
import simplejson as json
from twisted.internet import reactor
from twisted.internet.protocol import Factory
from ClassProtocol import ControlProtocol
from Host import Host
from User import User

class Classroom(object):
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

        self.classname=Configs.RootConfigs['classroomname']
        #Dictionary with the data of the classroom setup
        self.classsetup=Configs.MonitorConfigs.GetClassroomConfig(self.classname)
        
        #ControlProtocol boot up:
        pf = Factory()
        pf.protocol = ControlProtocol
        pf.protocol.add_callback("connected", self.addClient)
        pf.protocol.add_callback("alive", self.update_time_stamp)
        pf.protocol.add_callback("commands", self.getCommands)
        pf.protocol.add_callback("lost", self.removeClient)
        try:
            reactor.listenTCP(Configs.PORT+1, pf)
        except:
            reactor.listenTCP(Configs.PORT+2, pf)
                    
        
        #Dictionary with the Desktop positions to send to the frontend
        self.cols=int(self.classsetup['cols'])
        self.rows=int(self.classsetup['rows'])
        self.computers=int(self.classsetup['computers'])
        
        #creates the aula
        total=self.cols*self.rows
        self.Desktops=[]
        for i in range(total):
            self.Desktops.append(Desktop.Desktop(self))
        #if there is a saved structure, it recovers it:        
        if self.classsetup['structure']!='':
                targets=self.classsetup['structure'].split(',')
                for i in range(total):
                    try:
                        if targets[i]!='None':
                            self.Desktops[i].hostname=targets[i]
                    except:
                        pass #total is greater than len(targets)
                                          
        self.interval=refreshInterval
        self.oldJSON=''

        self.myVNC=VNC.VNC()
        self.broadcast=Broadcast.Vlc()
        self.current_request=None

    def existUser(self,key):
        """Check if a logged user has already been added to the classroom"""
        return self.LoggedUsers.has_key(key)
    
    def existPC(self, ip):
        """Check if a pc has already been added to the classroom"""
        return self.Hosts.has_key(ip)

    def addClient(self, protocol_data, client_data):
        is_host_not_user = client_data["isHostnotUser"]        
        if is_host_not_user:        
            host = Host(client_data['login'], client_data['hostname'],
                      client_data['hostip'], client_data['mac'],
                      client_data['ltsp'], client_data['classname'],
                      client_data['internetEnabled'], client_data['uuid'])
            self.addHost(host)
        else:
            user = User(client_data['login'], client_data['hostname'],
                      client_data['hostip'], client_data['ltsp'],
                      client_data['classname'], client_data['username'],
                      client_data['ipLTSP'], client_data['internetEnabled'],
                      client_data['mouseEnabled'], client_data['soundEnabled'],
                      client_data['messagesEnabled'], client_data['photo'], client_data['uuid'])
            self.addUser(user)
    
    def addHost(self, host):
        """Add a pc to the classroom"""
        if not self.Hosts.has_key(host.ip):
            logging.getLogger().debug('The  host  %s has appeared' %   (host.ip))
            self.Hosts[host.ip]=host
            #intialize list of commands for this client, if is a LTSP server, it needs to be added
            if not self.CommandStack.has_key(host.ip):                
                self.CommandStack[host.ip]=[]
            #save its mac address:
            Configs.MonitorConfigs.SaveMAC(host.hostname, host.mac)
            if host.hostname!=NetworkUtils.getHostName(): #the teacher host is not added to the list when it's LTSP
                self.placeHostDesktop(host.ip)
        self.getJSONFrontend("refresh")
    
    
    def addUser(self,user):
        """Add a logged user to the classroom"""
        key = user.login + '@' + user.ip
        if not self.LoggedUsers.has_key(key):
            logging.getLogger().debug('The user %s has appeared' % (key))
            self.LoggedUsers[key]=user
            #intialize list of commands for this client
            if not self.CommandStack.has_key(key):
                self.CommandStack[key]=[]              
            self.placeUserDesktop(key)
        else:
            self.LoggedUsers[key].uid=user.uid  # The user has reconnected
        self.getJSONFrontend("refresh")
                
    def addPhoto(self,path,key):
        self.LoggedUsers[key].photo=path
        for i in self.Desktops:
            if i.userkey==key:
                i.photo=path
                break
        self.getJSONFrontend("refresh")
    
    def removeClient(self, login, hostip):
        if login == 'root':
            self.removeHost(hostip)
        else:
            key = login + '@' + hostip
            self.removeUser(key)
    
    def removeUser(self, key):
        """Remove a logout user from the classroom data"""
        if self.LoggedUsers.has_key(key):
            self.LoggedUsers.pop(key)
            #self.CommandStack.pop(key)
            logging.getLogger().debug('The user %s has disappeared' % key)
            for desktop in self.Desktops:
                if desktop.userkey==key:
                    desktop.delUser()
                    break
            self.getJSONFrontend("refresh")
            
    def removeHost(self,hostip):
        """Remove a disconnected pc from the classroom data"""
        if self.Hosts.has_key(hostip):
            logging.getLogger().debug('The  host %s has disappeared' % hostip)            
            self.Hosts.pop(hostip)
            #self.CommandStack.pop(hostip)
            self.removeDesktop(hostip)
            
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
        if self.CommandStack.has_key(key):
            commands=self.CommandStack[key]
            self.CommandStack[key]=[]
            return commands
        else:
            return []

    def showCommands(self,key):
        """Returns the list of commands to be executed by an user or pc
        but keep them in the list"""  
        if self.CommandStack.has_key(key):            
            return self.CommandStack[key]
        else:
            return []
        
        
    def hasCommands(self,key):
        """Returns True if there are commands to be executed by an user or pc""" 
        if self.CommandStack.has_key(key):
            return self.CommandStack[key] != []
        else:
            return False
   

    def update_time_stamp(self, login, hostip):
        if login == 'root':
            self.updateHostTimeStamp(hostip)
        else:
            key = login + '@' + hostip
            self.updateUserTimeStamp(key)
                
    def updateHostTimeStamp(self,hostip):
        """Updates the last time the host contacted the teacher"""
        if self.Hosts.has_key(hostip):
            self.Hosts[hostip].timestamp = datetime.datetime.now() 
        
    def updateUserTimeStamp(self,key):
        """Updated the last time the logged user contacted the teacher"""
        if self.LoggedUsers.has_key(key):
            self.LoggedUsers[key].timestamp = datetime.datetime.now()    
                
    def UpdateLists(self):   
        """Remove the users or hosts that haven't contacted the teacher during
        the (seconds) interval"""

        for i in self.LoggedUsers.keys():
            if self.broadcast.broadcasting or self.myVNC.activeBB:
                self.updateUserTimeStamp(self.LoggedUsers[i].key)
            else:            
                if self._checkInterval(self.LoggedUsers[i],self.interval):
                    self.removeUser(i)
                
        for i in self.Hosts.keys():
            if self.broadcast.broadcasting or self.myVNC.activeBB:
                self.updateHostTimeStamp(self.Hosts[i].ip)
            else:
                if self._checkInterval(self.Hosts[i],self.interval):
                    self.removeHost(i)
                
        reactor.callLater(self.interval, self.UpdateLists)

                
    def _checkInterval(self,data,interval):
        if self.broadcast.broadcasting or self.myVNC.activeBB:
            return False
        """check if current time has passed data timestamp + 3 + interval (in seconds)"""         
        return (datetime.datetime.now()>data.timestamp+ datetime.timedelta(seconds=(3 +interval)))


    def shiftDesktop(self,index):
        '''Desktop at position index must be moved to the next free position'''
        newPosition=-1
        #First, let's try to move it down in the list of Desktops:
        for i in range(index+1,self.cols*self.rows-1):
            if self.Desktops[i].hostkey=='':
                newPosition=i
                break
                
        if newPosition==-1:
            newPosition= self.placeHostFreely()

        self.Desktops[newPosition]=self.Desktops[index]            
        self.Desktops[index]=Desktop.Desktop(self)
                
    
    def placeHostFreely(self):
        '''returns the first available position in the list of Desktops'''
        position=-1
        for i in range(self.cols*self.rows):
            if self.Desktops[i].hostkey=='':
                position=i
                break
                
        if position==-1: #There were not free places
            position=self.addDesktopsRow()
                       
        return position

    def addDesktopsRow(self):
        newPosition=self.cols*self.rows
        self.rows+=1
        for i in range(self.cols):
            self.Desktops.append(Desktop.Desktop(self))     
        return newPosition
        
    def removeDesktopsRow(self):
        self.rows-=1
        position=self.cols*self.rows 
        for i in range(self.cols):
            deleted=self.Desktops.pop(position)
            if deleted.hostname !='Unknown':                
                new_pos=self.findNamePosition(deleted.hostname)
                self.Desktops[new_pos]=deleted              

    def addDesktopsCol(self):
        cols=self.cols
        self.cols +=1
        for i in range(self.rows):
            self.Desktops.insert(i*self.cols +cols, Desktop.Desktop(self))
        
    def removeDesktopsCol(self):
        cols=self.cols
        self.cols-=1
        for i in range(self.rows-1,-1,-1):
            deleted=self.Desktops.pop(i*cols +self.cols)
            if deleted.hostname !='Unknown':                
                new_pos=self.findNamePosition(deleted.hostname)
                self.Desktops[new_pos]=deleted
            
    def placeHostDesktop(self,key):
        '''Puts a pc in the list of Desktops, according to its position'''
        #first, check if the position is already saved in the classroom setup:
        hostname=self.Hosts[key].hostname
        position=-1
        for i in range(len(self.Desktops)):
            if self.Desktops[i].hostname==hostname:
                position=i
                if self.Desktops[position].hostkey!='':
                    self.shiftDesktop(position) #The position was busy by a host and it has to be moved  
                break
        if position ==-1:#if it's not in the classroom setup, let's look for somewhere to place it:            
            position=self.findNamePosition(hostname)
            
        self.Desktops[position].putHost(self.Hosts[key],key)
        self.recheckUsersDesktops()
        self.saveClassLayout()
        
    def findNamePosition(self,hostname):
        position=-1
        number=MyUtils.getDesktopNumber(hostname)
        if number !='':
            position=int(number)            
            if position >0:
                #position -=1
                position=len(self.Desktops)-position
                if position<1:
                    position=self.placeHostFreely()                        
            if self.Desktops[position].hostkey!='':
                self.shiftDesktop(position) #The position was busy by a host and it has to be moved    
        else:
            position=self.placeHostFreely()
            
        return position

    def placeUserDesktop(self,key):
        user=self.LoggedUsers[key]
        validIP=user.ip
        if user.ltsp:
            validIP=user.ipLTSP
            
        for desktop in self.Desktops:
            if desktop.ip==validIP:
                desktop.putUser(user,key)
                break
        
       
    def recheckUsersDesktops(self):
        '''If for network issues the user connects before the host,
         the user must be added after the host is recognised'''
        for user in self.LoggedUsers.keys():
            homeless=True
            for i in self.Desktops:
                if i.userkey==user:
                    homeless=False
                    break
            if homeless:
                self.placeUserDesktop(user)
            
        
    def removeDesktop(self,ip):
        for desktop in self.Desktops:
            if desktop.mainIP==ip:                
                desktop.delHost()
                break

        self.getJSONFrontend("refresh")
        
        
    def getJSONFrontend(self,oldList):
        
        classroom={}
        classroom['pclist']=[]
        classroom['structure']={'classname':self.classname,'cols':self.cols,'rows':self.rows,'computers':self.computers}
        for i in self.Desktops:
            classroom['pclist'].append(i.getFrontendInfo())
        
        newJSON=json.dumps({'classroom':classroom})
        
        oldClass={'pclist':oldList}
        oldClass['structure']={'classname':self.classname,'cols':self.cols,'rows':self.rows,'computers':self.computers}
        self.oldJSON=json.dumps({'classroom':oldClass})

        if self.myVNC.activeBB:
            self.oldJSON=''
            
        if newJSON==self.oldJSON:
            classroom['pclist']=[]
            newJSON=json.dumps({'classroom':classroom})
        else:
            self.oldJSON=newJSON
            
        if self.current_request!=None:
            if not  self.current_request.finished:
                self.current_request.write(newJSON)
                self.current_request.finish()                
            else:           
                reactor.callLater(2,self.getJSONFrontend,"refresh")
            
        return newJSON
    
    def redistributeDesktops(self,targets,save=True):
        total=min(len(targets),len(self.Desktops))
        for i in range (total):
            name=targets[i]
            if name=='&nbsp;':
                name='none'
            if name=='None':
                name='Unknown'                
            if name!=self.Desktops[i].hostname:
                self.moveDesktopAt(name,i)
        if save: self.saveClassLayout()
                
    def moveDesktopAt(self, desktop_name,position):
        '''Move a Destkop in the list of Desktops at a fixed position'''
        previousDesktop=self.Desktops[position]
        oldposition=-1
        for i in range(len(self.Desktops)):
            if self.Desktops[i].hostname==desktop_name:
                newDesktop=self.Desktops[i]
                oldposition=i
                break
        #makes the moving:    
        if oldposition >-1: #there was a desktop previously on that place
            self.Desktops[oldposition]=previousDesktop
        self.Desktops[position]=newDesktop

    def saveClassLayout(self):
        layout=''
        for desktop in self.Desktops:
            layout +=',' + desktop.hostname
            
        self.classsetup['structure']=layout[1:]
        self.classsetup['rows']=str(self.rows)
        self.classsetup['cols']=str(self.cols)
        self.classsetup['computers']=str(self.computers)
        
        Configs.MonitorConfigs.SetClassroomConfig(self.classname,self.classsetup)
        self.getJSONFrontend("refresh")
        
