##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:     MyUtils.py
# Purpose:     Several  utilities to be used in Python
# Language:    Python 2.5
# Date:        27-Jan-2010.
# Ver:        27-Jan-2010.
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


import pwd,os,subprocess 
import NetworkUtils

def getLoginName():
    return pwd.getpwuid(os.getuid())[0]

def getFullUserName():
    return pwd.getpwuid(os.getuid())[4].split(",")[0]

def getHomeUser():
    return  pwd.getpwuid(os.getuid())[5]

def userIsTeacher(teachersGroup='teachers'):   
    p1 = subprocess.Popen(["id", "-Gn"], stdout=subprocess.PIPE)
    p2 = subprocess.Popen(["grep", teachersGroup], stdin=p1.stdout, stdout=subprocess.PIPE)
    output = p2.communicate()[0]
    return (output != '')

def isLTSP():
    ipLTSP=''
    if getLoginName()=='root':
        p1 = subprocess.Popen(["ps", "-AF"], stdout=subprocess.PIPE)
        p2 = subprocess.Popen(["grep", "ldm"], stdin=p1.stdout, stdout=subprocess.PIPE)
        p3 = subprocess.Popen(["grep","-v", "grep"], stdin=p2.stdout, stdout=subprocess.PIPE)
        output = p3.communicate()[0]
        if output != '':
            ipLTSP=NetworkUtils.get_ip_inet_address()
    else:
        try:
            ipLTSP=os.environ["LTSP_CLIENT"]
        except:
            pass

    return ipLTSP


def generateUUID(length=5):
    """returns a pseudo random string to be used as password.
    The length of the password is determined by the length parameter"""
    import uuid
    if length>32:
        length=32
    original=str(uuid.uuid4()).replace('-','')
    return original[:length]
    
    
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
    homefacelocal=os.path.join(getHomeUser(),'.face')
    homefaceglobal=os.path.join('/usr/share/pixmaps/faces',getLoginName() + '.png')
    if   os.path.exists(homefacelocal ):
        return homefacelocal
    elif os.path.exists(homefaceglobal):
        return homefaceglobal
    else:
        return ''   

def getLDMinfo():
    server=''
    socket=subprocess.Popen("ls /var/run/ldm_socket*",stdout=subprocess.PIPE,shell=True).communicate()[0]
    if socket!='':
        pos=  socket.rfind('_')
        server=socket[pos+1:]

    return (server.strip(),socket.strip())

def getXtty():
    from tempfile import mkstemp
    from shutil import copyfile
    xauth=''
    display=''
    if isLTSP()=='':
        command='COLUMNS=300  ps aux|grep -v grep|grep "\-auth"'
    else:
        command='COLUMNS=300  ps aux|grep -v grep|grep ldm'
        
    t=subprocess.Popen(command,stdout=subprocess.PIPE,shell=True).communicate()[0]
    p=t.strip().split()       
    for i in range(0,len(p)):
        if p[i][:1]==':':
            display=p[i]
        if p[i]=='-auth':
            xauth=p[i+1]
            break
        
    if display!='':
        display='DISPLAY=' + display + '.0'
        
    if xauth!='':
        xfile=mkstemp()[1]
        copyfile(xauth,xfile)
        os.chown(xfile,65534,0)
        xauth='XAUTHORITY='+xfile
        
    return (display,xauth)
    

