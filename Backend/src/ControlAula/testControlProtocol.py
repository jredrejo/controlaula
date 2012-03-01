#!/usr/bin/env python
# -*- coding: utf-8 -*-
##############################################################################
# Project:     Controlaula
# Module:    testControlProtocol.py
# Purpose:     Test module for ClassProtocol
# Language:    Python 2.6
# Date:        21-Jan-2012.
# Ver:        27-Jan-2012.
# Author:    José L.  Redrejo Rodríguez
# Copyright:    2009-2012 - José L. Redrejo Rodríguez       <jredrejo @nospam@ debian.org>
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

from twisted.internet import reactor
from twisted.internet.protocol import ReconnectingClientFactory
from ClassProtocol import ControlProtocol


Con = None


class ControlFactory(ReconnectingClientFactory):
    """Look at
    http://twistedmatrix.com/trac/browser/tags/releases/\
    twisted-8.2.0/twisted/internet/protocol.py
    for more info on this ReconnectClientFactory"""
    protocol = ControlProtocol


def connectionFailed(reason):
    print reason
    reactor.stop()
    return


def conectar():
    global con
    f = ControlFactory()

    iCon=reactor.connectTCP("172.16.3.207", 8901, f)
    #iCon = reactor.connectTCP("127.0.0.1", 8901, f)


def connected(protocol):
    if protocol:
        #doMath(protocol)
        pass
    else:
        try:
            reactor.stop()
        except:
            pass  # reactor was already stopped
    return


if __name__ == '__main__':

    reactor.callWhenRunning(conectar)

    reactor.run()
