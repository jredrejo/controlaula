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
from ControlAula.Plugins  import Handler
from ControlAula.Utils import Configs

import simplejson as json
import os
import TeacherServer

class ControlAulaProtocol(resource.Resource):
    """Respond with the appropriate ControlAUla  protocol response.
    A GET should return a file. A POST should use JSON to retrieve and send data
    """

    isLeaf = True  # This is a resource end point.


    def __init__ (self):
        resource.Resource.__init__(self)
        
        self.PageDir=""        
        self.teacher = TeacherServer.RPCServer()



    ########################################################
    # Return the page for a GET. This will handle requests
    # to read data.
    def render_GET(self, request):

        # Check if requested file exists.    
        if request.path[:13]=='/loginimages/' or request.path[:10]=='/sendfile/':
            requestedfile=os.path.join(Configs.APP_DIR , request.path[1:])
        else:    
            requestedfile = os.path.join(self.PageDir, request.path[1:])
        
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
            try:
                args=request.args['node']
            except:
                pass
                

        if handler.existCommand(command):
            #if it's a petition to execute some command
            try:
                if len(args)>0:
                    handler.args=[args]
                    #handler.args=['/opt/'+args]
                if json.loads(recvjson).has_key('pclist'):
                    first=json.loads(recvjson)['pclist'][0]
                    if ',' in first:
                        handler.targets=first.split(',')
                    else:
                        handler.targets=json.loads(recvjson)['pclist']
                
                if json.loads(recvjson).has_key('structure'):
                    structure=json.loads(recvjson)['structure']
                    handler.args=[structure['rows'],structure['cols']]
                result=handler.process(command)
                #respjson= json.dumps({'result':'ack'})
                respjson=json.dumps(result)
            except:
                pass
                
        else:
            #it's sending the classroom data
            try:                
                if command == 'datosAulaPrueba':
                    #testing file used by Manu:
                    inputFile=open(os.path.join(self.PageDir, 'datosAulaPrueba'),'r')
                    #inputFile=open('/var/www/datosAulaPrueba','r')
                    respjson= inputFile.read()
                    inputFile.close()
                elif command == 'datosaula':
                    if args=='refresh':
                        self.teacher.classroom.oldJSON=''
                    respjson= self.teacher.classroom.getJSONFrontend()
                    
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

