##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:    commands.py
# Purpose:     Control protocol based on amp to communicate with clients
# Language:    Python 2.6
# Date:        21-Jan-2012.
# Ver:        27-Jan-2012.
# Author:    José L.  Redrejo Rodríguez
# Copyright:    2009-2012 - José L. Redrejo Rodríguez  <jredrejo @nospam@ debian.org>
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

from twisted.protocols import amp
from twisted.protocols.basic import Int16StringReceiver
from struct import pack

class ListOf(amp.Argument):

    def __init__(self, elementType, optional=False):
        self.elementType = elementType
        amp.Argument.__init__(self, optional)

    def fromString(self, inString):
        strings = []
        parser = Int16StringReceiver()
        parser.stringReceived = strings.append
        parser.dataReceived(inString)
        return map(self.elementType.fromString, strings)

    def toString(self, inObject):
        strings = []
        for obj in inObject:
            serialized = self.elementType.toString(obj)
            strings.append(pack('!H', len(serialized)))
            strings.append(serialized)
        return ''.join(strings)

class Dict(amp.Argument):
  
    def __init__(self, subargs):
        self.subargs = subargs
  
    def fromStringProto(self, inString, proto):
        boxes = amp.parseString(inString)
        return amp._stringsToObjects(boxes[0], self.subargs, proto)
  
    def toStringProto(self, inObject, proto):
        return amp._objectsToStrings(inObject, self.subargs, amp.Box(), proto).serialize()


class RequestRegister(amp.Command):
    arguments = [('uid', amp.String())]   
    response = [('result', Dict([
        # common:
        ('login', amp.String()),
        ('hostname', amp.String()),
        ('hostip', amp.String()),
        ('ltsp', amp.Boolean()),
        ('classname', amp.String()),
        ('isHostnotUser', amp.Boolean()),
        ('uuid', amp.String()),
        # host:
        ('mac', amp.Unicode(True)),
        # user:
        ('username', amp.Unicode(True)),
        ('ipLTSP', amp.String(True)),
        ('internetEnabled', amp.Boolean(True)),
        ('mouseEnabled', amp.Boolean(True)),
        ('soundEnabled', amp.Boolean(True)),
        ('messagesEnabled', amp.Boolean(True)),
        ('photo', amp.Unicode(True))
         ]))]
    errors = {Exception: 'EXCEPTION'}



class Ping(amp.Command):
    arguments = [('login', amp.String()),('hostip', amp.String(True))]
    response = [('commands', amp.AmpList([('args', ListOf(amp.Unicode(),True))],True))]