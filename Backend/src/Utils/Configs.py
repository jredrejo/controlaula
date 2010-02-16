##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:     Configs.py
# Purpose:     Several  configs parameters for the application
# Language:    Python 2.5
# Date:        10-Feb-2010.
# Ver:        10-Feb-2010.
# Author:    José L. Redrejo Rodríguez
# Copyright:   2009 - José L. Redrejo Rodríguez    <jredrejo @nospam@ debian.org>
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
import NetworkUtils, MyUtils
import ConfigParser,re,os,shutil
    

APP_DIR=os.path.join(MyUtils.getHomeUser(),'.controlaula')
if not os.path.isdir(APP_DIR):
        os.mkdir(APP_DIR)
IMAGES_DIR=os.path.join(APP_DIR,'loginimages')
if not os.path.isdir(IMAGES_DIR):
        os.mkdir(IMAGES_DIR)
NOBODY_IMG=os.path.join(IMAGES_DIR,'nobody.png')
if not os.path.exists(NOBODY_IMG):
    shutil.copy2(os.path.join(os.getcwd(),'Monitor/nobody.png'),NOBODY_IMG)
LOG_FILENAME= os.path.join(MyUtils.getHomeUser(),'.controlaula/controlaula.log')

PORT=8900
PAGES='/var/www'
#Interval to check if the hosts are off or users have logout
REFRESH=5



def classroomName():
    return getClassroomName(NetworkUtils.getHostName())

def getClassroomName(name):
    '''for a hostname following the classroomname-oXX criteria, returns the classroom name'''
    
    hostname=name.strip().split('.')[0].replace('_','-')
    return hostname.split('-')[0]

def getDesktopNumber(name):
    '''for a hostname following the classroomname-oXX criteria, returns the "XX"'''
    hostname=name.strip().split('.')[0].replace('_','-')
    data=hostname.split('-')
    if len(data)>1:
        number=data[1]
    else:
        return ''
    
    if number.capitalize()=='PRO':
        return ''
    else:
        try:
            value=int(   number[-2:])
            return number[-2:]
        except:
            return ''


def getFaceFile():
    homefacelocal=os.path.join(MyUtils.getHomeUser(),'.face')
    homefaceglobal=os.path.join('/usr/share/pixmaps/faces',MyUtils.getLoginName() + '.png')
    if   os.path.exists(homefacelocal ):
        return homefacelocal
    elif os.path.exists(homefaceglobal):
        return homefaceglobal
    else:
        return ''
        
class SirvecoleConfig(object):


    def __init__(self,configname):
        '''
        Parameters: configname (string) - Name of configuration file.
        '''
        # Name of configuration file.
        self._ConfigFileName = configname
        
        
        # List of recognised protocols for the services     
        self._AllowedSections = ['default']
        
        
        #List of optional items
        self._OptionalItems=['url','icon','localpath','desktop','execute','update','updatefstab','newgrub']
        
        # Regex to check the tag names.
        self._TagCheck = re.compile('^[a-zA-Z_][0-9a-zA-Z_]*$')      
        
        # Dictionary for services .
        self._ConfigDict = {}
        
        self._ConfigParser = ConfigParser.ConfigParser()

        # If we were given a file name, read in and parse the configuration.
        if self._ConfigFileName:
            self._GetConfig() 

