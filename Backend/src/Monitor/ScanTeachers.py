##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:    ScanTeachers.py
# Purpose:     Class to browse the network looking for teachers
# Language:    Python 2.5
# Date:        18-Jan-2010.
# Ver:        29-Jan-2010.
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

try:
    import dbus    
    if getattr(dbus, 'version', (0,0,0)) >= (0,41,0):
        import dbus.glib    
except ImportError:
    dbus = None

if dbus:
    try:
        import avahi
    except ImportError:
        avahi = None
else:
    avahi = None

import logging

class AvahiMonitor():

    def __init__(self):
        self._callbacks = {'new-service':  [],
                           'remove-service': []
                           }
        # initialize dbus stuff needed for discovery
        
                           
        
        self.bus = dbus.SystemBus()
        
        avahi_bus = self.bus.get_object(avahi.DBUS_NAME, avahi.DBUS_PATH_SERVER)
        self.server = dbus.Interface(avahi_bus, avahi.DBUS_INTERFACE_SERVER)
        
        stype = '_controlaula._tcp'
        domain = 'local'
        self._plugged = {}

        avahi_browser = self.server.ServiceBrowserNew(avahi.IF_UNSPEC,
                                                      avahi.PROTO_UNSPEC,
                                                      stype, domain,
                                                      dbus.UInt32(0))
        obj = self.bus.get_object(avahi.DBUS_NAME, avahi_browser)
        self.browser = dbus.Interface(obj, avahi.DBUS_INTERFACE_SERVICE_BROWSER)

    def start(self):
        self.browser.connect_to_signal('ItemNew', self.new_service)
        self.browser.connect_to_signal('ItemRemove', self.remove_service)
        
    def stop(self):
        self.bus.close()

    def new_service(self, interface, protocol, name, type, domain, flags):
        
        def resolve_service_reply(*service):
            address, port = service[-4:-2]
            name = unicode(service[2])
            for cb in self._callbacks['new-service']:
                self._plugged[name] = (address,port)                
                cb(self,name, address, port)
                
        def resolve_service_error(exception):
            try:
                if exception._dbus_error_name=="org.freedesktop.Avahi.TimeoutError":
                    #let'st try it again
            #        self.stop()
            #     self.start()
                    pass            
            except:
                logging.getLogger().debug('could not resolve controlaula service %s %s: %s' %   (name, domain, exception))
                print exception

        self.server.ResolveService(interface, protocol, name, type, domain,
                avahi.PROTO_UNSPEC, dbus.UInt32(0),
                reply_handler=resolve_service_reply,
                error_handler=resolve_service_error)

    def remove_service(self, interface, protocol, name, type, domain,server):
        address, port = self._plugged[name]
        for cb in self._callbacks['remove-service']:
            cb(self,name, address, port)


    def add_callback(self, sig_name, callback):
        self._callbacks[sig_name].append(callback)

    def remove_callback(self, sig_name, callback):
        self._callback[sig_name].remove(callback)


