##############################################################################
# -*- coding: utf-8 -*-
# Project:     Controlaula
# Module:    TeacherMainLoop.py
# Purpose:     ControlAula server for the Teacher functions
# Language:    Python 2.5
# Date:        18-Jan-2010.
# Ver:        3-Feb-2010.
# Author:    José L.  Redrejo Rodríguez
# Copyright:    2009-2010 - José L. Redrejo Rodríguez       <jredrejo @nospam@ debian.org>
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



from twisted.web import server,resource,  static
import twisted
from ControlAula.Plugins  import Handler
from ControlAula.Utils import Configs,MyUtils
import cgi
import simplejson as json
import os,logging
import TeacherServer
from collections import defaultdict
from time import strftime,time
from urllib import unquote

class ControlAulaProtocol(resource.Resource):
    """Respond with the appropriate ControlAUla  protocol response.
    A GET should return a file. A POST should use JSON to retrieve and send data
    """

    isLeaf = True  # This is a resource end point.


    def __init__ (self):
        resource.Resource.__init__(self)
        
        self.PageDir=""
        self.teacher = TeacherServer.RPCServer()
        self.channels = defaultdict(list)
        self.publish_service=None

    ########################################################
    # Return the page for a GET. This will handle requests
    # to read data.
    def render_GET(self, request):

        pagename=request.path[1:].lower()
        
        if  pagename=='':
            request.path='/index.html'
            pagename='index.html'
        
        if request.host.host!='127.0.0.1' and pagename=='index.html':
            request.path='/student/chat.html'
            pagename='student/chat.html'

        #Announce the teacher after the first try of accesing the web interface            
        if not self.publish_service.online:
            self.publish_service.publish()
            
        # Check if requested file exists.    
        if request.path[:13]=='/loginimages/' or request.path[:10]=='/sendfile/':
            requestedfile=os.path.join(Configs.APP_DIR ,request.path[1:])
        elif '/controlaula-chat' in request.path:
                self.channels['controlaula-chat'].append(request)
                return server.NOT_DONE_YET           
        elif request.path[:9]=='/student/':
                requestedfile = os.path.join(self.PageDir,request.path[9:])                
        else:    
                requestedfile = os.path.join(self.PageDir,request.path[1:])

        requestedfile=unquote(requestedfile)
        if not os.path.isfile(requestedfile):
            # Didn't find it? Return an error.
            request.setResponseCode(404)
            return"""
            <html><head><title>404 - No Such Resource</title></head>
            <body><h1>No Such Resource</h1>
            <p>File not found: %s - No such file.</p></body></html>
            """ % requestedfile

        # Look for the requested file.
        f=static.File(requestedfile)

        
        if f.type is None:
            f.type, f.encoding = static.getTypeAndEncoding(requestedfile,
                f.contentTypes,
                f.contentEncodings,
                f.defaultType)        
        
        if f.type:
            ctype=f.type.split(":")[0]
            # Send the headers.
            request.setHeader('content-type', ctype)
            
        if f.encoding:
            request.setHeader('content-encoding', f.encoding)
        # Send the page.               
        if twisted.version.major >= 9:
            static.NoRangeStaticProducer(request,f.openForReading()).start()
        else:
            static.FileTransfer(f.openForReading(), f.getFileSize(), request)
        return server.NOT_DONE_YET


    def render_POST(self, request):
        """ Process a POST and return a response. This will handle
        all the AJAX read and write requests for data.
        """        
        if request.path=='/RPC2':
            return self.teacher.render(request)
        
        #Filter the command needed.
        command=request.path[1:]

        handler=Handler.Plugins(self.teacher.classroom)
        respjson=None       
        args=''
        
        #print command

        if 'controlaula-chat' in request.path:
            return self._handle_chat(request)
        
        #petition from the student controlaula
        student_asks=(request.path[:9]=='/student/')
        if student_asks:
            command=command.replace('student/','')            
            if command=='':
                return self._handle_chat(request)
                    
        try:
            recvjson='{}'            
            request.content.read()          
            if request.args.has_key('data'):
                recvjson = request.args['data'][0]    
                if recvjson=='':
                    recvjson='{}'        
            if json.loads(recvjson).has_key('args'):
                args=json.loads(recvjson)['args']
        except:
            pass
        if args=='':
            try:
                if 'dir' in request.args:
                    args=request.args['dir']
                elif 'message' in request.args:
                    args=request.args['message']    
            except:
                pass
                            
        if handler.existCommand(command):          
            #if it's a petition to execute some command
            try:
                if len(args)>0:
                    handler.args=[args] 
                else:
                    handler.args=[]
                if student_asks and command!='language':
                    if 'user_id' in request.args:                                         
                        user_key=request.args['user_id'][0] + '@' + request.client.host
                        if  type(args)!=type([]):
                            args=[args]
                        self.teacher.classroom.addCommand( user_key,command,args)
                        if command=='getAllNodes':
                            self.teacher.classroom.LoggedUsers[user_key].deferred_request=request
                            return server.NOT_DONE_YET                                 
                        else:                        
                            return json.dumps({'result':'ack'})
                                                          
                    #handler.args=['/opt/'+args]
                if json.loads(recvjson).has_key('pclist'):
                    first=json.loads(recvjson)['pclist'][0]
                    if ',' in first:
                        handler.targets=first.split(',')
                    else:
                        handler.targets=json.loads(recvjson)['pclist']
                
                if json.loads(recvjson).has_key('structure'):
                    structure=json.loads(recvjson)['structure']    
                    handler.args=[structure['rows'],structure['cols'],structure['computers']]
                result=handler.process(command)
                #respjson= json.dumps({'result':'ack'})
                if command not in ( 'getAllNodes' ,'getVideoNodes'):
                    respjson=json.dumps(result)
                else:
                    respjson=result
            except:
                pass
                
        else:
            #it's sending the classroom data
            try:                
                if command == 'datosaula':
                    if self.teacher.classroom.current_request==None or args=='refresh':
                        if self.teacher.classroom.current_request!=None: #close previously open request
                            try:
                                self.teacher.classroom.current_request.finish()
                            except:
                                pass #the connection is lost
                            self.teacher.classroom.oldJSON=''                            
                        self.teacher.classroom.current_request=request
                        self.teacher.classroom.getJSONFrontend(args)
                    else:
                        self.teacher.classroom.current_request=request
                    return server.NOT_DONE_YET                          
                else:
                    # Analyse the request and construct a response.
                    respjson= self._HandleMessage(recvjson) 
                    
            except:
                # The data wasn't found in the headers.
                pass

        # Return the JSON response.
        return respjson


    def _HandleMessage(self, recvjson):
        """Handle a protocol message.
        Parameters: recvjson (string) = The received JSON message.
        Returns: (string) = The response JSON string.
        """    
        
        # Decode the message.
        try:         
            pcs=json.loads(recvjson)['pcs']
            #add data
            pcs.append({'loginname':'este lo pone el backend','mouseEnabled':'False','internetEnabled':'False'})
            
            #Construct the response:
            return json.dumps({'classroom':{'pcs':pcs}})
        except:
            return None


    def response_fail(self, messages=None):
        messages = messages or []
        return json.dumps({
            'status': 'fail',
            'errors': messages,
            'time': int(time())
        })        
    def response_ok(self, **kwds):
        kwds.update({'status': 'ok', 'time': int(time())})
        return json.dumps(kwds)    
        

    def _handle_chat(self, request):
                   
        request.content.read() 
        if request.path=='/student/':                    
            if len(request.args)>0:
                requestedfile=os.path.join(self.PageDir,'chat.html')
                try:
                    page_to_send =open(requestedfile, "r").read()
                    html_to_send=page_to_send.replace('%(student_id)', request.args['login'][0])
                    return html_to_send 
                except:
                    request.setResponseCode(404)
                    return"""
                    <html><head><title>404 - No Such Resource</title></head>
                    <body><h1>No Such Resource</h1>
                    <p>File not found: %s - No such file.</p></body></html>
                    """ % requestedfile     
        else: #chatting
            user_host=request.client.host             
            user = request.args.get('user', user_host)
            key=user[0] + '@' + user_host
            try:
                if MyUtils.getLoginName() + '@127.0.0.1'!=key: 
                    if self.teacher.classroom.LoggedUsers[key].chat_enabled==False:return self.response_ok()
            except:
                return self.response_ok()
                           
            message = request.args.get('message', None)
            
            if not message:
                return self.response_fail(['*message* not found', ])
            message = cgi.escape(message[0])
            response = self.response_ok(user= [  '('+strftime('%H:%M:%S') + ') '+ user[0]], message=message)
            chat_logger = logging.getLogger('Chat')
            chat_logger.info(user[0] + ": " + message )            
            for chann_request in self.channels['controlaula-chat']:
                chann_request.write(response)
                chann_request.finish()
            del self.channels['controlaula-chat']
            return self.response_ok()         