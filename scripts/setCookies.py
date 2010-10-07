#!/usr/bin/python
# -*- coding: utf-8 -*-
##############################################################################
# Project:     Controlaula
# Module:      setCookies.py
# Purpose:     Set cookies for user into Mozilla Firefox and Google Chrome
# Language:    Python 2.5
# Date:        5-Oct-2010.
# Ver.:        7-Oct-2010.
# Copyright:    2009-2010 - Manu Mora Gordillo       <manuito @nospam@ gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
# 
# Important:    WHEN EDITING THIS FILE, USE TABS TO INDENT - NOT SPACES!
##############################################################################


from pysqlite2 import dbapi2 as sqlite
import getpass # Availability: Unix, Windows.
import os

def getPathCookiesFirefox():
	path = "/home/"+getpass.getuser()+"/.mozilla/firefox/"

	with open(path+"profiles.ini") as f:
		for line in f:
			fields = line.split("=")
			if fields[0]=="Path":
				
				return path+fields[1].strip("\n")



def setCookieFirefox ():

	path = getPathCookiesFirefox()
	pathCookies = path+"/cookies.sqlite"

	if os.path.isdir(path):

		connection = sqlite.connect(pathCookies)
		cursor = connection.cursor()

		cursor.execute("DELETE FROM moz_cookies WHERE name='controlaula.loginname'")
		connection.commit()

		cursor.execute("INSERT INTO moz_cookies (id, name, value, host) VALUES (null,'controlaula.loginname','"+getpass.getuser()+"','ControlAula')");
		connection.commit()



def setCookieChrome ():
	path = "/home/"+getpass.getuser()+"/.config/google-chrome/Default/"
	pathCookies = path+"Cookies"

	if os.path.isdir(path):

		connection = sqlite.connect(pathCookies)
		cursor = connection.cursor()

		cursor.execute("DELETE FROM cookies WHERE name='controlaula.loginname'")
		connection.commit()

		cursor.execute("INSERT INTO cookies (creation_utc, name, value, host_key, path, expires_utc, secure, httponly, last_access_utc) VALUES (null,'controlaula.loginname','"+getpass.getuser()+"','ControlAula','/','12940149655000000','0','0','12924381655978530')");
		connection.commit()


if __name__ == '__main__':

	setCookieFirefox ()
	setCookieChrome ()
