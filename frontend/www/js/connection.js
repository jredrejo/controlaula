/*
 * connection.js
 *
 * Copyright (c) 2009-2010 Manu Mora Gordillo <manuito @nospam@ gmail.com>
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 * 
 */

var dataRefresh = $.JSON.encode({"args" : "refresh"});


var REFRESH_BIGBROTHER = 3000; /* in miliseconds*/
var REFRESH_CLASSROOM = 5000; /* in miliseconds*/

//Init screens
function initScreens(){
	connection("datosaula",dataRefresh,"printClassroom");
	setInterval('connection("datosaula","","refreshClassroom")',REFRESH_CLASSROOM);
}

var lastPClist;

// Funcion general de connection
function connection(url,data,action){

	if(url=="datosaula" && data!=dataRefresh)
		var data = $.JSON.encode({"args" : lastPClist});

	datatosent=new Object()
	datatosent.data=data

	$.ajax({ 
		url : url , 
		type: 'POST',
		data : datatosent,
		success: function (result) { 
			// distintas respuestas segun la accion enviada
			switch(action){
				case "printClassroom":{
					printClassroom(result);
					break;
				}
				case "refreshClassroom":{
					refreshClassroom(result);
					break;
				}
		/*		case "pintaconfig":{
					printClassroomConfig(result.responseText);
					break;
				}
				case "cambiaconfig":{
					connection("datosaula","","pintaaula");
					break;
				}
				case "broadcastVideo":{
					maskWindow.hide();

					resultJSON = Ext.util.JSON.decode(result.responseText);
					if(resultJSON.result=="Bad file"){
						Ext.Msg.alert('Atención', 'Archivo de video incorrecto.');
						return;
					}else if(resultJSON.result=="ack"){
						winSendVideo.hide();
					    Ext.example.msg('Emitir Vídeo','Comienza la emisión del vídeo.');
					}
					break;
				}
				case "broadcastDVD":{
					maskWindow.hide();

					resultJSON = Ext.util.JSON.decode(result.responseText);
					if(resultJSON.result=="Bad DVD"){
						Ext.Msg.alert('Atención', 'DVD incorrecto.');
						return;
					}else if(resultJSON.result=="ack"){
						winDVD.hide();
					    Ext.example.msg('Emitir DVD','Comienza la emisión del DVD.');
					}
					break;
				}
				case "sendFile":{
					maskWindow.hide();

					resultJSON = Ext.util.JSON.decode(result.responseText);
					if(resultJSON.result=="Bad send"){
						Ext.Msg.alert('Atención', 'Ocurrió un error.');
						return;
					}else if(resultJSON.result=="ack"){
						winSendFile.hide();
					    Ext.example.msg('Envíar Archivo','El envío se ha realizado correctamente.');
					}
					break;
				}
				case "sendMessage":{
					maskWindow.hide();

					resultJSON = Ext.util.JSON.decode(result.responseText);
					if(resultJSON.result=="Bad send"){
						Ext.Msg.alert('Atención', 'Ocurrió un error.');
						return;
					}else if(resultJSON.result=="ack"){
						winSendMessage.hide();
					    Ext.example.msg('Envíar Mensaje','El envío se ha realizado correctamente.');
					}
					break;
				}*/
				default:{}
			}
		},
		failure: function ( result, request) { 
			//document.getElementById("contenedor").innerHTML += "Error: "+result.responseText+"<br>";
		} 
  });
}
