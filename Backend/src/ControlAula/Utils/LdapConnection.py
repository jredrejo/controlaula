##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:     LdapConnection.py
# Purpose:     Module to connect to ldap server
# Language:    Python 2.5
# Date:        28-Apr-2010.
# Ver.:        28-Apr-2010.
# Copyright:    2010 - Manu Mora Gordillo       <manuito @nospam@ gmail.com>
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

import ldap

class ldapconnection:
	'''
	classdocs
	'''
	def __init__(self,ldap_server,user,passw):
		self.ldap_server=ldap_server
		self.user=user
		self.passw=passw
		self.Desktops=[]
		self.con=ldap.initialize(self.ldap_server)

	def connect(self):		
		try:
			self.con.simple_bind_s(self.user,self.passw)
		except ldap.INVALID_CREDENTIALS:
			logging.getLogger().debug('LDAP user or password incorrect')
			return False
		except ldap.LDAPError:
			logging.getLogger().debug('LDAP error connect')
			return False

		return True

	def search(self,base_dn,filter,attrs):
		result = self.con.search_s( base_dn, ldap.SCOPE_SUBTREE, filter, attrs )
		return result

	def searchClassroomComputers(self,classroom):
		''' How many groups? '''
		base_dn = 'cn=THINCLIENTS,cn=DHCP Config,dc=instituto,dc=extremadura,dc=es'
		filter = '(cn=group*)'
		attrs = ['cn']
		groups = self.search(base_dn,filter,attrs)
		numberDesktops=0;
		for i in range(0,len(groups)):
			''' search computers of different groups '''
			base_dn = 'cn='+groups[i][1]['cn'][0]+',cn=THINCLIENTS,cn=DHCP Config,dc=instituto,dc=extremadura,dc=es'
			filter = '(cn='+classroom+'-o*)'
			attrs = ['cn','dhcpHWAddress']
			computers = self.search(base_dn,filter,attrs)
			for j in range(0,len(computers)):
				ltsp = {'desktop':computers[j][1]['cn'][0] , 'mac':computers[j][1]['dhcpHWAddress'][0].replace('ethernet ','')}
				self.Desktops.append(ltsp)

	def getLTSPDesktops(self):
		return self.Desktops
