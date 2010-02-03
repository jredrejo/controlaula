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
# ZeroConf-Services is free software: you can redistribute it and/or modify
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

ipLTSP=''

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
    try:
        ipLTSP=os.environ["LTSP_CLIENT"]
        return True
    except:
        ipLTSP=''
        return False





def createVNCPassword( passwd,file):
    """
    createVNCPassword("micasa","/tmp/vnc")
    """
    import crippled_des
    #
    # We use a fixed key to store passwords, since we assume that our local
    # file system is secure but nonetheless don't want to store passwords
    # as plaintext.
    #
    
    fixedKey = "\x17Rk\x06#NX\x07"    

    pw = (passwd + '\0' * 8)[:8]        #make sure its 8 chars long, zero padded
    des = crippled_des.DesCipher(fixedKey)
    response = des.encrypt(pw)

    f = open(file, "w")
    f.write(response)
    f.close



