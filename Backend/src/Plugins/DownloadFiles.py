##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:     DownloadFiles.py
# Purpose:     Module to download files from the teacher
# Language:    Python 2.5
# Date:        9-Mar-20010.
# Ver.:        10-Mar-2010.
# Copyright:    2009-2010 - José L. Redrejo Rodríguez       <jredrejo @nospam@ debian.org>
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
##############################################################################
from twisted.web import client
from twisted.internet.defer import Deferred,DeferredList
from twisted.internet import reactor
from Utils import MyUtils  
    
class DownloadQueue(object):
    #maximum simultaneous downloads:
    SIZE = 50

    def __init__(self):
        self.requests = [] # queued requests
        self.deferreds = [] # waiting requests
    
    def addRequest(self, uri, file,exitfunc):
        self.exitfunc=exitfunc
        if len(self.deferreds) >= self.SIZE:
            # wait for completion of all previous requests
            DeferredList(self.deferreds
            ).addCallback(self._callback)
            self.deferreds = []
            
            # queue the request
            deferred = Deferred()
            self.requests.append((uri, file,deferred))
            
            return deferred
        else:
            # execute the request now
            #deferred = downloadPage(url, file)
            host, port, url = MyUtils.parse(uri)
            f = client.HTTPDownloader(uri, file)
            f.deferred.addCallbacks(callback=self.exitfunc,
                                callbackArgs=(file,) )
                    
            self.deferreds.append(f.deferred)
            reactor.connectTCP(host, port, f)
            
            return f.deferred
    
    def _callback(self):
        if len(self.requests) >self.SIZE:
            queue = self.requests[:self.SIZE]
            self.requests = self.requests[self.SIZE:]
        else:
            queue = self.requests[:]
            self.requests = []
        
        # execute the requests
        for (uri,file,  deferredHelper) in queue:
            
            host, port, url = MyUtils.parse(uri)
            f = client.HTTPDownloader(uri, file)
            f.deferred.addCallbacks(callback=self.exitfunc,    callbackArgs=(file,))
                    
            self.deferreds.append(f.deferred)
            reactor.connectTCP(host, port, f)            
                    
            f.deferred.chainDeferred(deferredHelper)
            
