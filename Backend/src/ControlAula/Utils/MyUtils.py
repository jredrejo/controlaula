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
# ControlAula is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
# You should have received a copy of the GNU General Public License
# along with ControlAula. If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################


import pwd,os,subprocess,logging
import shutil
import NetworkUtils

loginname=''
fullusername=''
homeuser=''
bssid=''
ipLTSP='unknown'

def getLoginName():
    global loginname
    #loginname=''
    if loginname=='':
        loginname=pwd.getpwuid(os.getuid())[0]
    return loginname

def getFullUserName():
    global fullusername
    if fullusername=='':
        fullusername=pwd.getpwuid(os.getuid())[4].split(",")[0]
    return fullusername

def getHomeUser():
    global homeuser
    if homeuser=='':
        homeuser=pwd.getpwuid(os.getuid())[5]
    return  homeuser

def userIsTeacher(teachersGroup='teachers'):   
    p1 = subprocess.Popen(["id", "-Gn"], stdout=subprocess.PIPE)
    p2 = subprocess.Popen(["grep", teachersGroup], stdin=p1.stdout, stdout=subprocess.PIPE)
    output = p2.communicate()[0]
    return (output != '')

def isLTSP():
    global ipLTSP
    if ipLTSP!='unknown':
        return ipLTSP
    
    ipLTSP=''
    if getLoginName()=='root':
        p1 = subprocess.Popen(["ps", "-AF"], stdout=subprocess.PIPE)
        p2 = subprocess.Popen(["grep", "ldm"], stdin=p1.stdout, stdout=subprocess.PIPE)
        p3 = subprocess.Popen(["grep","-v", "grep"], stdin=p2.stdout, stdout=subprocess.PIPE)
        output = p3.communicate()[0]
        if output != '':
            ipLTSP=NetworkUtils.get_ip_inet_address()
            if ipLTSP=='':
                ipLTSP=NetworkUtils.get_ip_inet_address('192.168.0.254')
    else:
        try:
            ipLTSP=os.environ["LTSP_CLIENT"]
        except:
            pass

    return ipLTSP



def snapshot(thumbpath,x=300,y=300):
    try:
        import gtk.gdk
        w = gtk.gdk.get_default_root_window() 
        sz = w.get_size() 
        pb = gtk.gdk.Pixbuf(gtk.gdk.COLORSPACE_RGB,False,8,sz[0],sz[1]) 
        pb = pb.get_from_drawable(w,w.get_colormap(),0,0,0,0,sz[0],sz[1])         
        
        if sz[0] > x or sz[1] > y:
            scaleFactor = 1.0 * x / sz[0]
            if sz[1] * scaleFactor > y:
                scaleFactor = 1.0 * y/ sz[1]
            
            finalsize=[ int(sz[0] * scaleFactor),int(sz[1] * scaleFactor)]
            pb = pb.scale_simple(finalsize[0], finalsize[1], gtk.gdk.INTERP_BILINEAR)
            
    except:
        import sys
        from PyQt4.QtGui import QPixmap, QApplication 
        from PyQt4.QtCore import  Qt
        app = QApplication(sys.argv) 
        pb=QPixmap.grabWindow(QApplication.desktop().winId())
        pb = pb.scaled(x,y, Qt.KeepAspectRatio,Qt.SmoothTransformation)
        
        

    if (pb != None): 
        pb.save(thumbpath,'png') 
        return True
    else:
        return False
    

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
    NetworkUtils.getWirelessData()
    classname="noclassroomname" 
    hostname=name.strip().split('.')[0].replace('_','-')
    items=hostname.split('-')
    if len(items)==2:
        if len(items[1])==3 and (items[1].upper()=='PRO' or items[1][:1].upper()=='O'):
            classname= items[0]
            return classname
    
    if NetworkUtils.essid!='':
        classname=NetworkUtils.essid
        
    return classname

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
    from time import sleep
    disp,auth=getXttyAuth()
        
    if disp!='':
        display='DISPLAY=' + disp
        
    if auth!='':
        xfile=mkstemp()[1]
        sleep(0.5)
        copyfile(auth,xfile)
        os.chown(xfile,65534,0)
        xauth='XAUTHORITY='+xfile
    else:
        xauth=''
        
    return (display,xauth)
    
def getXttyAuth():
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

    if xauth=='':
        xauth=os.path.join(getHomeUser(),  '.Xauthority'   )
                    
    if getLoginName()=='root':       

        command='xauth -f ' + xauth + ' add `hostname -s`/unix' + display + ' . ' + generateUUID(24)
        subprocess.Popen(command,stdout=subprocess.PIPE,shell=True)
        os.environ['XAUTHORITY']=xauth
               
    if display!='':
        display=display + '.0'
                                
    return (display,xauth)
    
def launchAsNobody(command):
    display,xauth=getXtty()
    finalcommand='su -c \"' + xauth + ' ' + display + ' ' + command + '\" nobody'
    logging.getLogger().debug(finalcommand)
    proc=subprocess.Popen(finalcommand, stdout=subprocess.PIPE,shell=True)    
    return proc    
        
def parse(url):
    import urlparse
    parsed = urlparse.urlparse(url)
    url = urlparse.urlunparse(('','')+parsed[2:])
    host, port = parsed[1], 80
    if ':' in host:
        host, port = host.split(':')
        port = int(port)
    return host, port, url            
            
def guessDesktop():
    from os import environ
    desktop='default'
    
    if environ.has_key('DESKTOP_SESSION'):
        desktop=environ["DESKTOP_SESSION"]
        
    if desktop=='default':
        if environ.has_key('KDE_FULL_SESSION'):
            desktop='kde'
        elif environ.has_key('GNOME_DESKTOP_SESSION_ID'):
            desktop='gnome'
      
    return desktop

def backupDir(src,dst):
    import shutil     
    if os.path.exists(dst):
        shutil.rmtree(dst, True)
    shutil.copytree(src,dst)
        
def restoreDir(src,dst):
    if os.path.exists(src):
        backupDir(src,dst)

def isActive():
    logged = subprocess.Popen("who|cut -f1 -d' '|uniq", shell=True,stdout=subprocess.PIPE).communicate()[0]  
    loggedusers=logged.splitlines()
    user= getLoginName()
    active=(user in loggedusers)

    return active 

def putLauncher(teacher_ip='',teacher_port=8900,isTeacher=False):
    from Configs import WWWPAGES,APP_DIR
    requestedfile=os.path.join(WWWPAGES,'controlaula.html')
    local_web_dir=os.path.join(APP_DIR,'www')
    if not os.path.exists(local_web_dir):
        try:
            os.mkdir(local_web_dir)
            shutil.copy(os.path.join(WWWPAGES,'js/jquery/jquery-1.4.2.min.js') , os.path.join(local_web_dir,'jquery-1.4.2.min.js'))
            shutil.copy(os.path.join(WWWPAGES,'img/controlaula.png') , os.path.join(local_web_dir,'controlaula.png'))
        except:
            logging.getLogger().debug('Error copying www pages to user directory')
                        
        
    page_to_send =open(requestedfile, "r").read()
    html_to_save=page_to_send.replace('%(user_id)', getLoginName())
    html_to_save=html_to_save.replace('%(teacher_ip)', teacher_ip)
    html_to_save=html_to_save.replace('%(teacher_port)',str(teacher_port))
    if isTeacher:
        html_to_save=html_to_save.replace('%(isteacher)', 'true')
    else:
        html_to_save=html_to_save.replace('%(isteacher)', 'false')
        
    f = open(os.path.join(APP_DIR,'controlaula.html') , 'wb')
    f.write(html_to_save)
    f.close()
    
