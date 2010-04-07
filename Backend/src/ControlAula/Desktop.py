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
# ControlAula is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
# You should have received a copy of the GNU General Public License
# along with ControlAula. If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
class Desktop(object):
    
    def __init__(self,classroom):
        self.hostkey=''
        self.userkey=''
        self.login=''
        self.username=''
        self.hostname='Unknown'
        self.ip=''
        self.ltsp=False
        self.internet=0
        self.sound=0
        self.mouse=0
        self.messages=0
        self.photo=''
        self.mainIP=''
        self.video=False
        self.bigbrother=False
        self.projector=False
        self.classroom=classroom

    def __str__(self):
        return str((self.hostkey,self.userkey,self.login,self.username,self.hostname,self.ip,self.ltsp, self.internet,self.sound,self.mouse,self.messages,self.photo))

    def _KeyboardMouse(self,value,command):
        if self.hostkey!='':
            self.classroom.CommandStack[self.mainIP].append([command])       
            self.mouse=value
            if self.userkey!='':
                self.classroom.CommandStack[self.userkey].append([command])
                self.classroom.LoggedUsers[self.userkey].mouse=value
                
    def enableKeyboardMouse(self):
        self._KeyboardMouse('1','enableMouse')
        
    def disableKeyboardMouse(self):
        self._KeyboardMouse('0','disableMouse')
        
    def _Sound(self,value,command):
        if self.userkey!='':        
            self.classroom.CommandStack[self.userkey].append([command])
            self.sound=value
            self.classroom.LoggedUsers[self.userkey].sound=value
        
    def enableSound(self):
        self._Sound('1','enableSound')
        
    def disableSound(self):
        self._Sound('0','disableSound')
               
        
    def  _Internet(self,value,command):
        if self.userkey!='':
            self.classroom.CommandStack[self.userkey].append([command])
            #the host must disable internet to this user:
            self.classroom.CommandStack[self.ip].append(['root'+command,self.login])
            self.internet=value
            self.classroom.Hosts[self.mainIP].internetEnabled=value
            self.classroom.LoggedUsers[self.userkey].internet=value        
        
    def enableInternet(self):
        self._Internet('1','enableInternet')     
        
    def disableInternet(self):
        self._Internet('0','disableInternet')              
            
    def _Messages(self,value,command):
        if self.userkey!='':
            self.classroom.CommandStack[self.userkey].append([command])
            self.messages=value
            self.classroom.LoggedUsers[self.userkey].messages=value  
            
    def enableMessages(self):
        self._Messages('1', 'disableMessages')    

    def disableMessages(self):
        self._Messages('0', 'enableMessages')   
        
    def sendMessage(self,text):
        if self.userkey!='':
            self.classroom.CommandStack[self.userkey].append(['receiveMessage',text])
                    
    def setProjector(self):
        if self.hostkey!='':
            self.classroom.CommandStack[self.mainIP].append(['projector'])
            self.projector=True
            self.disableKeyboardMouse()
            
    def resetProjector(self):
        if self.hostkey!='':
            self.classroom.CommandStack[self.mainIP].append(['resetProjector'])
            self.projector=False
            self.enableKeyboardMouse()
            
    def setBigBrother(self):
        if self.userkey!='':
            from shutil import copyfile
            from Utils import Configs
            import os.path            
            if not self.bigbrother:      
                photo=os.path.basename(self.photo)          
                self.classroom.LoggedUsers[self.userkey].shotname=photo
                try:
                    copyfile(os.path.join(Configs.IMAGES_DIR,photo),os.path.join(Configs.IMAGES_DIR + '/screenshots',photo))
                except:
                    pass
                self.classroom.CommandStack[self.userkey].append(['bigbrother'])
                self.bigbrother=True
                
    def resetBigBrother(self):
        if self.userkey !='':
            self.classroom.CommandStack[self.userkey].append(['disablebigbrother'])     
            self.bigbrother=False 
            
    def sendBroadcast(self,url,isDVD):
        if self.hostkey!='':
            self.classroom.CommandStack[self.mainIP].append(['broadcast',url,isDVD])
            self.disableKeyboardMouse()     
            self.video=True 
                  
    def stopBroadcast(self):
            if self.hostkey!='':
                self.classroom.CommandStack[self.mainIP].append(['stopBroadcast'])        
                self.enableKeyboardMouse()
                self.video=False
                
    def sleep(self):
        if self.hostkey!='':
            self.classroom.CommandStack[self.mainIP].append(['sleep']) 
            
    def sendFile(self,command,filename):
        if self.userkey!='':
            self.classroom.CommandStack[self.userkey].append([command,filename])      
            
    def launchWeb(self,url):
        if self.userkey!='':
                self.classroom.CommandStack[self.userkey].append(['launchweb',url])              
                       
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
        self.ip=user.ip
        self.ltsp=user.ltsp
        if user.ltsp:
            self.mainIP=user.ipLTSP
        else:
            self.mainIP=user.ip


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
        dict['video']=self.video
        dict['bigBrother']=self.bigbrother
        dict['projector']=self.projector
        
        return dict
    
    def getScreenshotInfo(self):
        ''' builds the line that must be passed to the frontend for this desktop
       
        '''
        dict={}
        dict['name']=self.login
        dict['pcname']=self.hostname
        if self.userkey=='':
            dict['url']=''
        else:
            dict['url']='loginimages/screenshots/'+ self.classroom.LoggedUsers[self.userkey].shotname
    
        return dict        
    