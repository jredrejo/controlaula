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
import MyUtils

import ConfigParser,os,shutil, logging


class SirvecoleConfig(object):


    def __init__(self,configname):
        '''
        Parameters: configname (string) - Name of configuration file.
        '''
        # Name of configuration file.
        self._ConfigFileName = configname
        
        
        # List of recognised sections    
        self._AllowedSections = ['General']
      
        
        #List of optional items
        self._OptionalItems=['seapaga','offactivated','iniciosininet','startwithoutinternet','iniciosinraton',
                             'startwithoutmouse','iniciosinsonido','startwithoutsound','iniciosinmensajes',
                             'startwithoutmessages', 'classroomname','allowburstwol']
        #to be used with legacy versions of ControlAula
        self._translatedict={'seapaga':'offactivated','iniciosininet':'startwithoutinternet',
                             'iniciosinraton':'startwithoutmouse','iniciosinsonido':'startwithoutsound',
                             'iniciosinmensajes':   'startwithoutmessages'}
        
        # Dictionary for services .
        self._ConfigDict = {}
        
        self._ConfigParser = ConfigParser.ConfigParser()

        # If we were given a file name, read in and parse the configuration.
        if self._ConfigFileName:
            self._GetConfig() 

    def GetConfig(self):
        """ Returns  a set of configuration dictionaries.
        """
        return self._ConfigDict['General']
    
    
    
    def _GetConfig(self):
        """ Read in the configuration file and update the configuration results. 
        Returns: Nothing
        """
        
        # Read in the configuration file.
        filename = self._ConfigParser.read(self._ConfigFileName)

        # The parser should have returned the name of the requested file. 
        try:
            if (filename[0] != self._ConfigFileName):
                logging.getLogger().error('Wrong /etc/sirvecole config file. Using default values')
                self._ConfigDict['General']=self._GetSectionItems('General',self._ConfigParser)
        except:
            logging.getLogger().debug('Could not find an /etc/sirvecole config file. Using default values')
            self._ConfigDict['General']=self._GetSectionItems('General',self._ConfigParser)
            return


        # Get a list of sections. Each section represents one service to configure.
        sectionlist = self._ConfigParser.sections()
        
        # Go through the list of sections one at a time.
        for i in sectionlist:
            if i in self._AllowedSections:
                sectionconfig = self._GetSectionItems(i, self._ConfigParser)
                # If it was OK, add it to the overall config dictionary.
                if (sectionconfig != None):
                    self._ConfigDict[i] = sectionconfig


########################################################
    def _GetSectionItems(self, sectionname, parser):
        """ Get the list of items in a section. 
        Parameters: sectionname (string): The name of the section.
        sectionitems: The list of section items.
        Returns: A dictionary with the parameters for the section,
            or None if an error occured.
        """
        #Default values:
        configuration={'offactivated':'0','startwithoutinternet':'0',
                             'startwithoutmouse':'0','startwithoutsound':'0',
                             'startwithoutmessages':'0', 'classroomname':MyUtils.classroomName(),'allownurstwol':'1'}
      

        # Now, go through all the remaining items in the section, 
        # and check for options
        try:
            itemlist = self._ConfigParser.items(sectionname)
        except:
            return configuration
        
        for i in itemlist:
            # First, check to see if it is a parameter already dealt with.
            if i[0] in self._OptionalItems:
                optionname = i[0]
                if self._translatedict.has_key(optionname):
                    optionname=self._translatedict[optionname]
                configuration[optionname]=str(i[1]).replace('"','')
  
        return configuration
                

class MonitorConfig(object):


    def __init__(self,configname):
        '''
        Parameters: configname (string) - Name of configuration file.
        '''
        # Name of configuration file.
        self._ConfigFileName = configname
        
        # List of recognised sections    
        self._AllowedSections = ['General','MAC']    
        

        #List of optional items
        self._OptionalItems=['internet','mouse','sound','messages']

        
        # Dictionary for services .
        self._ConfigDict = {}
        
        self._GeneralConfig = {}
        self._MACS={}
        
        self._ConfigParser = ConfigParser.ConfigParser()

        # If we were given a file name, read in and parse the configuration.
        if self._ConfigFileName:
            self._GetConfig() 

    def GetGeneralConfig(self,key):
        ''' Returns  a set of configuration dictionaries.
        '''
        return str(self._GeneralConfig[key])
    
    def GetClassroomConfig(self,classroom):
        if not self._ConfigDict.has_key(classroom):
            #the classroom is not in the config file, so an entry is created:
            self._ConfigParser.add_section(classroom) 
            self._ConfigParser.set(classroom,'rows','5')
            self._ConfigParser.set(classroom,'cols','3')
            self._ConfigParser.set(classroom,'structure','')
            self.SaveConfig()
            sectionconfig = self._GetSectionItems('classroom', self._ConfigParser)
            self._ConfigDict[classroom] = sectionconfig
            
            
        return self._ConfigDict[classroom] 
    
    
    def GetMAC(self,hostname):
        ''' Returns  the mac address of a host.
        '''
        if self._MACS.has_key(hostname):
            return self._MACS[hostname]   
        else:
            return ''     
        
    
    def SetGeneralConfig(self,key,value):
        self._GeneralConfig[key]=value
        self._ConfigParser.set("General",key,value)
        self.SaveConfig()
        
    def SetClassroomConfig(self,classroom,valuesdict):    
        for i in valuesdict:
            value=valuesdict[i]
            self._ConfigDict[classroom][i]=value
            self._ConfigParser.set(classroom,i,value)
            self.SaveConfig()         
            
    def SaveMAC(self,hostname,mac):
        '''save the mac of a hostname in the config file'''
        if self.GetMAC(hostname)==mac:
            return
        self._MACS[hostname]=mac
        self._ConfigParser.set("MAC",hostname,mac)
        self.SaveConfig()        
        
        
    def GetConfig(self):
        """ Returns  a set of configuration dictionaries.
        """
        return self._ConfigDict
    
    def _GetConfig(self):
        """ Read in the configuration file and update the configuration results. 
        Returns: Nothing
        """
        
        # Read in the configuration file.
        filename = self._ConfigParser.read(self._ConfigFileName)

        # The parser should have returned the name of the requested file. 
        try:
            if (filename[0] != self._ConfigFileName):
                logging.getLogger().error('Wrong /etc/sirvecole config file. Using default values')
                self._GeneralConfig=self._GetGeneralItems(self._ConfigParser)
        except:
            logging.getLogger().debug('Could not find an /etc/sirvecole config file. Using default values')
            self._GeneralConfig=self._GetGeneralItems(self._ConfigParser)
            return

        if self._GeneralConfig=={}:
            msgconfig = self._GetGeneralItems(self._ConfigParser)
            if (msgconfig != None):
                self._GeneralConfig= msgconfig
                
        if not self._ConfigParser.has_section('MAC'):
            self._ConfigParser.add_section('MAC') 
            self.SaveConfig()
            
        if self._MACS=={}:
            msgconfig = self._GetSectionItems('MAC',self._ConfigParser)
            if (msgconfig != None):
                self._MACS= msgconfig
                
        # Get a list of sections. Each section (Excepting General) represents one classroom to configure.
        sectionlist = self._ConfigParser.sections()
                 
        
        # Go through the list of clasroom one at a time.
        for i in sectionlist:
            if i not  in self._AllowedSections:
                sectionconfig = self._GetSectionItems(i, self._ConfigParser)
                # If it was OK, add it to the overall config dictionary.
                if (sectionconfig != None):
                    self._ConfigDict[i] = sectionconfig



    def _GetSectionItems(self, sectionname, parser):
        """ Get the list of items in a section. 
        Parameters: sectionname (string): The name of the classroom
        sectionitems: The list of section items.
        Returns: A dictionary with the parameters for the classroom
            or None if an error occured.
        """
        #Default values:
        configuration={'rows':'5','cols':'3','structure':''}
      

        # Now, go through all the remaining items in the section, 
        # and check for options
        try:
            itemlist = self._ConfigParser.items(sectionname)
        except:
            return configuration 
        
        for i in itemlist:
            optionname = i[0]
            configuration[optionname]=str(i[1]).replace('"','')
  
        return configuration

    def _GetGeneralItems(self, parser):
        """ Get the list of items in a section. 
        Parameters: sectionname (string): The name of the section.
        sectionitems: The list of section items.
        Returns: A dictionary with the parameters for the section,
            or None if an error occured.
        """
        #Default values:
        configuration={'internet':'1','mouse':'1','sound':'1','messages':'1'}
      

        # Now, go through all the remaining items in the section, 
        # and check for options
        # Now, go through all the remaining items in the section, 
        # and check for options
        try:
            itemlist = self._ConfigParser.items('General')
        except:
            return configuration
        
        for i in itemlist:
            # First, check to see if it is a parameter already dealt with.
            if i[0] in self._OptionalItems:
                optionname = i[0]
                configuration[optionname]=str(i[1]).replace('"','')
  
        return configuration
                                
    def SaveConfig(self):    
        configfile=open(self._ConfigFileName , 'wb')
        self._ConfigParser.write(configfile)
        configfile.close()
        
                                
########################################################                                
APP_DIR=os.path.join(MyUtils.getHomeUser(),'.controlaula')
if not os.path.isdir(APP_DIR):
        os.mkdir(APP_DIR)
IMAGES_DIR=os.path.join(APP_DIR,'loginimages')
if not os.path.isdir(IMAGES_DIR):
        os.mkdir(IMAGES_DIR)
        
FILES_DIR=os.path.join(APP_DIR,'sendfile')
if not os.path.isdir(FILES_DIR):
        os.mkdir(FILES_DIR)
                
NOBODY_IMG=os.path.join(IMAGES_DIR,'nobody.png')
if not os.path.exists(NOBODY_IMG):
    shutil.copy2(os.path.join(os.getcwd(),'Monitor/nobody.png'),NOBODY_IMG)
LOG_FILENAME= os.path.join(MyUtils.getHomeUser(),'.controlaula/controlaula.log')

PORT=8900
PAGES='/var/www'
#Interval to check if the hosts are off or users have logout
REFRESH=5
                
RootConfigs=SirvecoleConfig('/etc/sirvecole').GetConfig() 
CONF_FILENAME=os.path.join(APP_DIR,'monitor.cfg')
if not os.path.exists(CONF_FILENAME):  
    config = ConfigParser.RawConfigParser()                
    config.add_section('General')
    config.set('General','internet','1')
    config.set('General','mouse','1')
    config.set('General','sound','1')       
    config.set('General','messages','1')     
    configfile=open(CONF_FILENAME, 'wb')
    config.write(configfile)
    configfile.close()    
    
MonitorConfigs=MonitorConfig(CONF_FILENAME)