##############################################################################
# -*- coding: utf-8 -*-
# Project:     ControlAula
# Module:     Announce.py
# Purpose:     Do the avahi publications.
# Language:    Python 2.5
# Date:        29-May-2009.
# Ver:        28-May-2009.
# Author:    José L. Redrejo Rodríguez
# Copyright:   2009 - José L. Redrejo Rodríguez    <jredrejo @nospam@ debian.org>
#
# ControlAula  is free software: you can redistribute it and/or modify
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
import avahi
import dbus
from twisted.internet.protocol import DatagramProtocol
from twisted.internet import reactor
from twisted.application.internet import MulticastServer

MCAST_ADDR = "224.0.0.1"
MCAST_PORT = 11011

class MulticastServerUDP(DatagramProtocol):
    def __init__(self,name,text):
        self.data=str(text) + name
    
    def startProtocol(self):
        self.transport.joinGroup(MCAST_ADDR)

    def datagramReceived(self, datagram, address):
        if datagram == 'ControlAula':
            #print "ok-datagram", str(address)
            self.transport.write(self.data, address)
            
class Publications(object):
    '''
       """A simple class to publish a network service with zeroconf using
    avahi.
    '''


    def __init__(self, name,  port,stype="_controlaula._tcp",text="", domain="", host=""):        
        '''
        Initialize the parameters of the avahi announce
        Use always port 3000 for this zeroconf-services announces
        '''
        self.name = name
        self.stype = stype
        self.domain = domain
        self.host = host
        self.port = port
        self.text = text
        try:
            reactor.listenMulticast(MCAST_PORT, MulticastServerUDP(name,text))
        except: #port not usable, plan B is not valid, trusting only in avahi
            pass 

    def publish(self):
        bus = dbus.SystemBus()
        server = dbus.Interface(
                         bus.get_object(
                                 avahi.DBUS_NAME,
                                 avahi.DBUS_PATH_SERVER),
                        avahi.DBUS_INTERFACE_SERVER)

        g = dbus.Interface(
                    bus.get_object(avahi.DBUS_NAME,
                                   server.EntryGroupNew()),
                    avahi.DBUS_INTERFACE_ENTRY_GROUP)

        g.AddService(avahi.IF_UNSPEC, avahi.PROTO_UNSPEC,dbus.UInt32(0),
                     self.name, self.stype, self.domain, self.host,
                     dbus.UInt16(self.port), avahi.string_array_to_txt_array(self.text ))
            


        g.Commit()
        self.group = g
    
    def unpublish(self):
        self.group.Reset()
                
