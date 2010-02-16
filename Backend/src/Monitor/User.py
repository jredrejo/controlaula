##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:    User.py
# Purpose:     Model a logged user
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
class User(object):
    
    def __init__(self,login,hostname,hostip,ltsp,classname,username,ipLTSP,internetEnabled,mouseEnabled,soundEnabled,messagesEnabled,photo=''):
        self.login=login
        self.hostname=hostname
        self.ip=hostip
        self.ltsp=ltsp
        self.classname=classname
        self.username=username
        self.ipLTSP=ipLTSP
        self.internet=internetEnabled
        self.mouse=mouseEnabled
        self.sound=soundEnabled
        self.messages=messagesEnabled
        self.photo=photo
        if self.photo=='':
            self.photo='loginimages/nobody.png'
        self.timestamp=datetime.datetime.now()

    def __str__(self):
        return str( (self.login,self.hostname,self.hostip,self.ltsp,self.classname,self.username, self.ipLTSP, self.internet, self.mouse, self.sound, self.messages, self.photo,self.timestamp))