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
from ControlAula.Utils import NetworkUtils,Configs
import os,time
import pynotify

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
        pynotify.init('controlaula')
                    
    def xmlrpc_getCommands(self, login,hostip):
        """Return the list of commands to be executed by the client"""
        if login=='root':
            key=hostip
        else:
            key =login+'@'+hostip    
        commands=self.classroom.getCommands(key)    
        return commands
    
    def xmlrpc_connData(self):
        return self.classroom.myVNC.getData() + (self.classroom.broadcast.getData(),)
        
    def xmlrpc_screenshot(self,login,hostip, sfile):
        key =login+'@'+hostip
        if  not self.classroom.LoggedUsers.has_key(key):
            return   "ok"
        datum = sfile.data
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
    
    def xmlrpc_facepng(self,login,hostip, sfile):
        key =login+'@'+hostip
        datum = sfile.data
        thefacename=os.path.join(Configs.IMAGES_DIR,login + '.png')
        try:
            theface = open(thefacename, "wb")
            theface.write(datum)
            theface.close()
            self.classroom.addPhoto('/loginimages/' + login + '.png',key)
        except:
            pass
        
        return "ok"    
    
    def xmlrpc_file(self,login, sfile,filename):
        datum = sfile.data
        received_dir=os.path.join(Configs.FILES_DIR,self.classroom.classname,login)
        if not os.path.exists(received_dir):
            os.makedirs(received_dir)
        
        received_file=os.path.join(received_dir,filename)
        try:
            thefile = open(received_file, "wb")
            thefile.write(datum)
            thefile.close()
            note=login + " ha enviado el fichero "
            note +="<a href='file:///" + received_file + "'>" + filename +"</a>" 
            n=pynotify.Notification("Fichero recibido",note,"dialog-information")
            n.set_timeout(pynotify.EXPIRES_DEFAULT)
            n.show()            
            
        except:
            pass

        return "ok"        

    def xmlrpc_getAnswer(self,login,hostip,answer):
        key =login+'@'+hostip 
        deferred_request=self.classroom.LoggedUsers[key].deferred_request
        if  deferred_request is not None:
            deferred_request.write(answer)
            deferred_request.finish()
            self.classroom.LoggedUsers[key].deferred_request=None
        return ""
    