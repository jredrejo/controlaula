##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:     MyUtils.py
# Purpose:     Several  utilities to be used in Python
# Language:    Python 2.5
# Date:        27-Jan-2010.
# Ver:        27-Jan-2010.
# Author:    José L. Redrejo Rodríguez
# Copyright:  2009 - José L. Redrejo Rodríguez  <jredrejo @nospam@ debian.org>
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


import pwd
import os
import subprocess
import logging
import shutil
import NetworkUtils
import uuid
from glob import glob
loginname = ''
fullusername = ''
homeuser = ''
bssid = ''
ipLTSP = 'unknown'
PROC_TCP = "/proc/net/tcp"

def getLoginName():
    global loginname
    #loginname = ''
    if loginname == '':
        loginname = pwd.getpwuid(os.getuid())[0]



    return loginname


def getFullUserName():
    global fullusername
    if fullusername == '':
        fullusername = pwd.getpwuid(os.getuid())[4].split(",")[0]
    return fullusername


def getHomeUser():
    global homeuser
    if homeuser == '':
        homeuser = pwd.getpwuid(os.getuid())[5]
    return  homeuser


def userIsTeacher(teachersGroup='teachers'):
    p1 = subprocess.Popen(["id", "-Gn"], stdout=subprocess.PIPE)
    p2 = subprocess.Popen(["grep", teachersGroup], stdin=p1.stdout,
                          stdout=subprocess.PIPE)
    output = p2.communicate()[0]
    return (output != '')
    #return False


def isLTSP():
    global ipLTSP
    if ipLTSP != 'unknown':
        return ipLTSP

    for i in glob('/tmp/*.controlaula'):
        os.remove(i)

    ipLTSP = ''
    if getLoginName() == 'root':
        p1 = subprocess.Popen(["ps", "-AF"], stdout=subprocess.PIPE)
        p2 = subprocess.Popen(["grep", "ldm"], stdin=p1.stdout,
                              stdout=subprocess.PIPE)
        p3 = subprocess.Popen(["grep", "-v", "grep"], stdin=p2.stdout,
                              stdout=subprocess.PIPE)
        output = p3.communicate()[0]
        if output != '':
            ipLTSP = NetworkUtils.get_ip_inet_address()
            if ipLTSP == '':
                ipLTSP = NetworkUtils.get_ip_inet_address('192.168.0.254')
    else:
        try:
            ipLTSP = os.environ["LTSP_CLIENT"]
        except:
            pass

    return ipLTSP


def isLTSPServer():
    return NetworkUtils.defaultGW() != NetworkUtils.ltspGW()


def snapshot(thumbpath, x=300, y=300):
    try:
        import gtk.gdk
        w = gtk.gdk.get_default_root_window() 
        sz = w.get_size()
        pb = gtk.gdk.Pixbuf(gtk.gdk.COLORSPACE_RGB, False, 8, sz[0], sz[1])
        pb = pb.get_from_drawable(w, w.get_colormap(),
                                  0, 0, 0, 0, sz[0], sz[1])

        if sz[0] > x or sz[1] > y:
            scaleFactor = 1.0 * x / sz[0]
            if sz[1] * scaleFactor > y:
                scaleFactor = 1.0 * y / sz[1]

            finalsize = [int(sz[0] * scaleFactor), int(sz[1] * scaleFactor)]
            pb = pb.scale_simple(finalsize[0], finalsize[1], gtk.gdk.INTERP_BILINEAR)

    except:
        import sys
        from PyQt4.QtGui import QPixmap, QApplication 
        from PyQt4.QtCore import  Qt
        app = QApplication(sys.argv)
        pb = QPixmap.grabWindow(QApplication.desktop().winId())
        pb = pb.scaled(x, y, Qt.KeepAspectRatio, Qt.SmoothTransformation)

    if (pb != None):
        pb.save(thumbpath, 'png')
        return True
    else:
        return False


def generateUUID(length=5):
    """returns a pseudo random string to be used as password.
    The length of the password is determined by the length parameter"""
    import uuid
    if length > 32:
        length = 32
    original = str(uuid.uuid4()).replace('-', '')
    return original[:length]


def classroomName():
    return getClassroomName(NetworkUtils.getHostName())


def getClassroomName(name):
    '''for a hostname following the classroomname-oXX criteria,
    returns the classroom name'''
    NetworkUtils.getWirelessData()
    classname = "noclassroomname"
    hostname = name.strip().split('.')[0].replace('_', '-')
    items = hostname.split('-')
    if len(items) == 2:
        if len(items[1]) == 3 and (items[1].upper() == 'PRO'
                                    or items[1][:1].upper() == 'O'):
            classname = items[0]
            return classname

    if NetworkUtils.essid != '':
        classname = NetworkUtils.essid

    return classname


def getDesktopNumber(name):
    '''for a hostname following the classroomname-oXX criteria,
    returns the "XX"'''
    hostname = name.strip().split('.')[0].replace('_', '-')
    data = hostname.split('-')
    if len(data) > 1:
        number = data[1]
    else:
        return ''

    if number.capitalize() == 'PRO':
        return ''
    else:
        try:
            value = int(number[-2:])
            return number[-2:]
        except:
            return ''


def getFaceFile():
    homefacelocal = os.path.join(getHomeUser(), '.face')
    homefaceglobal = os.path.join('/usr/share/pixmaps/faces',
                                  getLoginName() + '.png')
    if   os.path.exists(homefacelocal):
        return homefacelocal
    elif os.path.exists(homefaceglobal):
        return homefaceglobal
    else:
        return ''


def getLDMinfo():
    server = ''
    socket = subprocess.Popen("ls /var/run/ldm_socket*",
                              stdout=subprocess.PIPE,
                              shell=True).communicate()[0]
    if socket != '':
        pos = socket.rfind('_')
        server = socket[pos + 1:]

    return (server.strip(), socket.strip())


def dpms_on():
    disp, xauth = _get_disp_tty()
    try:
        subprocess.Popen('xset -d ' + disp + ' dpms force on', shell=True)
    except:
        pass


def _get_disp_tty():
    xauth = ''
    display = ''
    command = 'COLUMNS=300  ps aux|grep -v grep|grep "\-auth"'

    prt = subprocess.Popen(command, stdout=subprocess.PIPE, shell=True)
    prt.wait()
    t = prt.communicate()[0]
    p = t.strip().split()
    for i in range(0, len(p)):
        if p[i][:1] == ':':
            display = p[i]
        if p[i] == '-auth':
            xauth = p[i + 1]
            break
    if isLTSP() != '':
    	xauth=os.path.join(glob("/var/run/ldm-xauth*")[0],"Xauthority")

    if getLoginName() != 'root':
        display = os.environ["DISPLAY"].split(".")[0]

    if xauth == '':
        xauth = os.path.join(getHomeUser(), '.Xauthority')

    return (display, xauth)


def ltsp_logged():
    """returns True if not user is logged"""
    if isLTSP() != '' and getLoginName() == 'root':
        command = 'COLUMNS=300  ps aux|grep -v grep|grep ldm_socket'
        prt = subprocess.Popen(command, stdout=subprocess.PIPE, shell=True)
        prt.wait()
        t = prt.communicate()[0]
        return  t == ''
    else:
        return True


def not_ltsp_logged():
    """returns True if not user is logged"""
    logged = subprocess.Popen(["users"],
                              stdout=subprocess.PIPE).communicate()[0]
    loggedusers = logged.split()
    not_root = [i for i in loggedusers if i != 'root']
    return len(not_root) == 0


def logged_user():
    logged = getLoginName()
    if logged == 'root':
        if isLTSP() != '':
            pass

        else:
            all_users = subprocess.Popen(["users"],
                                stdout=subprocess.PIPE).communicate()[0]
            loggedusers = all_users.split()
            non_root = [n for n in loggedusers if n != 'root']
            if len(non_root) > 0:
                logged = non_root[0]

    return logged


def getXtty():
    from tempfile import mkstemp
    from shutil import copyfile
    from time import sleep

    disp, xauth = _get_disp_tty()
    semaphore = len(glob('/tmp/*.controlaula')) == 0 

    if semaphore:
        command = 'xauth -f ' + xauth + ' add `hostname -s`/unix' + disp + ' . ' + generateUUID(24)
        subprocess.Popen(command, stdout=subprocess.PIPE, shell=True)
        os.environ['XAUTHORITY'] = xauth

    if disp != '':
        disp = disp + '.0'
        display = 'DISPLAY=' + disp
    if semaphore:
        if xauth != '':
            xfile = mkstemp(suffix='.controlaula')[1]
            sleep(0.5)
            copyfile(xauth, xfile)
            try:
                os.chown(xfile, 65534, 0)
            except:
                pass
            xauth = 'XAUTHORITY=' + xfile
            os.environ['XAUTHORITY'] = xfile
        else:
            xauth = ''

    if 'XAUTHORITY' in os.environ:
        xauth =  'XAUTHORITY=' + os.environ['XAUTHORITY']
    else:
        os.environ['XAUTHORITY']=xauth

    return (disp, display, xauth)


def launchAsNobody(command):
    return launchAs(command)


def launchAs(command, login="nobody"):
    disp, display, xauth = getXtty()
    environment = {"DISPLAY": disp,"XAUTHORITY":os.environ['XAUTHORITY']}
    if  isLTSP() != '' and getLoginName() == 'kkroot' and not ltsp_logged():
        finalcommand = 'su -c \"' + display + ' ' + command + '\" %s' % (login)
    else:
        finalcommand = 'su -c \"' + display + ' ' + command + '\" %s' % (login)
    logging.getLogger().debug(finalcommand)
    try:
        proc = subprocess.Popen(finalcommand, stdout=subprocess.PIPE,
                                shell=True, env=environment)
    except:
        proc = None


    return proc


def parse(url):
    import urlparse
    parsed = urlparse.urlparse(url)
    url = urlparse.urlunparse(('', '') + parsed[2:])
    host, port = parsed[1], 80
    if ':' in host:
        host, port = host.split(':')
        port = int(port)
    return host, port, url


def guessDesktop():
    from os import environ
    desktop = 'default'

    if 'DESKTOP_SESSION' in environ:
        desktop = environ["DESKTOP_SESSION"]

    if desktop == 'default':
        if 'KDE_FULL_SESSION' in environ:
            desktop = 'kde'
        elif 'GNOME_DESKTOP_SESSION_ID' in environ:
            desktop = 'gnome'

    return desktop


def backupDir(src, dst):
    if os.path.exists(dst):
        shutil.rmtree(dst, True)
    shutil.copytree(src, dst)


def restoreDir(src, dst):
    if os.path.exists(src):
        backupDir(src, dst)


def isActive():
    """Detect if the user who launch this process is still
    logged in the system, to avoid zombies """
    #logged = subprocess.Popen("who|cut -f1 -d' '|uniq", shell=True,
    #stdout=subprocess.PIPE).communicate()[0]
    logged = subprocess.Popen(["users"],
                              stdout=subprocess.PIPE).communicate()[0]
    loggedusers = logged.split()
    user = getLoginName()
    active = user in loggedusers

    return active


def launcherData(filter_port=None):
    from Configs import TEACHER_UID
    loginuser = getLoginName()
    homeuser = getHomeUser()   
    teacher = userIsTeacher()
    user_uid = TEACHER_UID
    if filter_port:
        connected = user_conn(filter_port,loginuser)
        if connected != loginuser:
            loginuser = connected
            teacher = False
            homeuser = pwd.getpwnam(connected)[5]
            user_uid = str(uuid.uuid1())
    return {"home": homeuser, "login": loginuser, "teacher": teacher, "uid": user_uid}


def putLauncher(teacher_ip='', teacher_port=8900, isTeacher=False):
    from Configs import WWWPAGES, APP_DIR, TEACHER_UID
    requestedfile = os.path.join(WWWPAGES, 'controlaula.html')
    local_img_dir = os.path.join(APP_DIR, 'img')
    local_js_dir = os.path.join(APP_DIR, 'js', 'jquery')
    if not os.path.exists(local_img_dir):
        try:
            os.mkdir(local_img_dir)
            shutil.copy(os.path.join(WWWPAGES, 'img', 'controlaula.png'),
                        os.path.join(local_img_dir, 'controlaula.png'))
        except:
            logging.getLogger().debug('Error copying www pages to user dir')
    if not os.path.exists(os.path.join(local_js_dir, 'jquery.min.js')):
        try:
            os.makedirs(local_js_dir)
            shutil.copy(os.path.join(WWWPAGES, 'js', 'jquery', 'jquery.min.js'),
                        os.path.join(local_js_dir, 'jquery.min.js'))
        except:
            logging.getLogger().debug('Error copying www pages to user dir')

    page_to_send = open(requestedfile, "r").read()
    html_to_save = page_to_send.replace('%(user_id)', getLoginName())
    html_to_save = html_to_save.replace('%(teacher_ip)', teacher_ip)
    html_to_save = html_to_save.replace('%(teacher_port)', str(teacher_port))
    if isTeacher:
        html_to_save = html_to_save.replace('%(isteacher)', 'true')
        html_to_save = html_to_save.replace('%(teacher_uid)', TEACHER_UID)
    else:
        html_to_save = html_to_save.replace('%(isteacher)', 'false')

    f = open(os.path.join(APP_DIR, 'controlaula.html'), 'wb')
    f.write(html_to_save)
    f.close()

    if isTeacher:
        teacher_ip = 'localhost'
    addon_info = '{"url": "http://' + teacher_ip + '", "isTeacher": ' + str(isTeacher).lower() + ', "port": "' + str(teacher_port) + '"}'
    f2 = open(os.path.join(APP_DIR, 'data.json'), 'wb')
    f2.write(addon_info)
    f2.close()

def _hex2dec(s):
    return str(int(s,16))


def _ip(s):
    ip = [(_hex2dec(s[6:8])),(_hex2dec(s[4:6])),(_hex2dec(s[2:4])),(_hex2dec(s[0:2]))]
    return '.'.join(ip)


def _remove_empty(array):
    return [x for x in array if x !='']


def _convert_ip_port(array):
    host,port = array.split(':')
    return _ip(host),_hex2dec(port)


def user_conn(filter_port,user):
    connected = user
    try:
        f = open(PROC_TCP,'r')
        content = f.readlines()
        content.pop(0)
    except:
        return
    for line in content:
        line_array = _remove_empty(line.split(' '))
        l_host,l_port = _convert_ip_port(line_array[1])
        r_host,r_port = _convert_ip_port(line_array[2])
        if filter_port:
            if filter_port != r_port and filter_port != l_port:
                continue
        uid = pwd.getpwuid(int(line_array[7]))[0]
        if uid != user:
            connected = uid                    
    return connected
