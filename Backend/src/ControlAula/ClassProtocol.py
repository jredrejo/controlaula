##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:    Classprotocol.py
# Purpose:     Control protocol based on amp to communicate with clients
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
from twisted.protocols import amp
from twisted.internet import reactor
from twisted.internet.error import ConnectionDone
from twisted.internet.protocol import Factory
from twisted.protocols import policies
from ControlAula.Utils import  Configs, MyUtils,NetworkUtils
from commands import RequestRegister, Ping

class ControlProtocol(amp.AMP, policies.TimeoutMixin):
    connection_pool = {}
    timeout_delay = 10
    _callbacks = {'connected': [], 'lost': [], 'alive': [],'commands':[]}

    @classmethod
    def add_callback(self, sig_name, callback):
        ControlProtocol._callbacks[sig_name].append(callback)

    @classmethod
    def clean_callbacks(self):
        ControlProtocol._callbacks = {'connected': [], 'lost': [], 'alive': []}

    def connectionMade(self):
        """This event raises when a connection is made,
        both on the server and client sides"""
        def checkin(v):
            """Add the connected client to the connection_pool"""
            ControlProtocol.connection_pool[v['result']['uuid']]['hostip'] = \
                                v['result']['hostip']
            ControlProtocol.connection_pool[v['result']['uuid']]['login'] = \
                                v['result']['login']
            
            for cb in ControlProtocol._callbacks['connected']:
                cb(self.transport.getPeer(), v['result'])
        
        amp.AMP.connectionMade(self)
        self.setTimeout(ControlProtocol.timeout_delay)
        #If I am the server, do things:
        try:
            if self.transport.client:
                self.server = True
                new_transport = self.transport.getPeer()
                new_uuid = new_transport.host + ':' + str(new_transport.port)
                ControlProtocol.connection_pool[new_uuid] = {}
                #Order the client to register & collect the data via checkin:
                order = self.callRemote(RequestRegister, uid=new_uuid)
                order.addCallback(checkin)
        except:
            self.server = False  # I am a client, not a server

    def timeoutConnection(self):
        if self.server:
            self.server_unplug()
        else:
            self.client_unplug()
                    
        if self.transport:
            self.transport.loseConnection()


    def connectionLost(self, reason):
        amp.AMP.connectionLost(self, reason)
        if self.server:
            self.server_unplug()
        else:
            try:
                if reason.check(ConnectionDone):  #desconectado correctamente
                    self.client_unplug()
                print "Conexión perdida con %s" % self.my_server
            except:
                pass

    def client_unplug(self):
        """unplug teacher for this client"""
        for cb in ControlProtocol._callbacks['lost']:
            cb()
                   
    def server_unplug(self):
        """Pop the client from the connection_pool, unplugging this student
        from the list of clients for this teacher"""            
        key = self._transportPeer.host + ':' + str(self._transportPeer.port)
        if ControlProtocol.connection_pool.has_key(key):  #else it has already been unplugged            
            unplugged = ControlProtocol.connection_pool[key]
            ControlProtocol.connection_pool.pop(key)
            if len(unplugged) >0 :
                for cb in ControlProtocol._callbacks['lost']:
                    cb(unplugged['login'], unplugged['hostip'])  
                      
    @RequestRegister.responder
    def requestRegister(self, uid):
        """The client sends the registration data to the server
        and start pings as a keepalive detection"""
        self.uuid = uid
        self.my_server = self.transport.getPeer()
        self.mylogin = MyUtils.getLoginName()
        self.hostip = NetworkUtils.get_ip_inet_address(self.transport.getPeer().host)
        is_host_not_user = (self.mylogin=='root')
        isLTSP = MyUtils.isLTSP()

        info_host = {'login' : self.mylogin,
                   'hostname' : NetworkUtils.getHostName(),
                   'hostip' : self.hostip,
                   'ltsp' : isLTSP != '',
                   'classname' : Configs.RootConfigs['classroomname'],
                   'isHostnotUser' : is_host_not_user ,
                   'uuid' : self.uuid
                   }                 

        if is_host_not_user :
            info_host['mac'] = NetworkUtils.get_inet_HwAddr(self.transport.getPeer().host)
        else:
            info_host['username'] = MyUtils.getFullUserName()
            info_host['ipLTSP'] = isLTSP
            info_host['internetEnabled'] = Configs.MonitorConfigs.GetGeneralConfig('internet') == '1'
            info_host['mouseEnabled'] = Configs.MonitorConfigs.GetGeneralConfig('mouse') == '1'
            info_host['soundEnabled'] = Configs.MonitorConfigs.GetGeneralConfig('sound') == '1'
            info_host['messagesEnabled'] = Configs.MonitorConfigs.GetGeneralConfig('messages') == '1'
            info_host['photo'] = ''
            
        self.doPing()            
        return {'result': info_host}                
                  

    @Ping.responder
    def ping(self,login,hostip):
        self.resetTimeout()
        self.client_login = login
        self.client_hostip = hostip
        for cb in ControlProtocol._callbacks['alive']:
            cb(login,hostip)

        if login == 'root':
            key = hostip
        else:
            key =login + '@' + hostip

        new_commands=[]
        added_commands=[]
        for cb in ControlProtocol._callbacks['commands']:
            add_command=cb(key)
            if len(add_command) >0 : 
                for command in add_command:
                    # convert to String all the elements:
                    safe_command=[]
                    for i in command:
                        if type(i) is list:
                            str_i=[str(n) for n in i]
                            safe_command = safe_command + str_i                            
                        else:
                            safe_command.append(str(i))
                    added_commands.append(safe_command)

        if len(added_commands) > 0:
            for command in added_commands:
                new_commands.append({'args':command})
        #return {'commands':[{'args':["1","2","3"]},{'args':['hola',]}]}
        return {'commands': new_commands}

    def resetTimer(self, instructions):
        """Reset the timeout when a ping succeeds"""
        self.resetTimeout()
        
        if len(instructions["commands"]) > 0:
            orders=[]
            for order in instructions["commands"]:
                received_order=order['args']
                orders.append([True if i=='True' else False if i=='False' else i for i in received_order])
            for cb in ControlProtocol._callbacks['commands']:
                cb(orders)

    def pingFailed(self, reason):
        """Error callback for pings"""
        if reason.check(ConnectionDone):  #desconectado correctamente
            self.client_unplug()                

    def doPing(self):
        """Do pings to the server whenever a connection exists:"""
        d = self.callRemote(Ping, login = self.mylogin, hostip=  self.hostip)
        d.addCallback(self.resetTimer)
        d.addErrback(self.pingFailed)
        if self.transport:
            reactor.callLater(ControlProtocol.timeout_delay / 2, self.doPing)


def main():
    """main method used only for testing purposes"""
    def conectado(*args):
        print "conectado", args

    def contacto(*args):
        print "contacto", args

    def desconectado(*args):
        print "desconectado", args

    pf = Factory()
    pf.protocol = ControlProtocol
    pf.protocol.add_callback("connected", conectado)
    pf.protocol.add_callback("alive", contacto)
    pf.protocol.add_callback("lost", desconectado)
    reactor.listenTCP(1234, pf)
    print 'started'
    reactor.run()

if __name__ == '__main__':
    main()
