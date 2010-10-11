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
			var res = $.parseJSON(result);

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
				}*/
				case "broadcast":{

					$( "#dialogAlert" ).dialog( "close" );
					if(res.result=="ack"){
						$( "#dialogSendFile" ).dialog( "close" );

						modalAlert("Comienza la emisi&oacute;n de v&iacute;deo");
						setTimeout('$( "#dialogAlert" ).dialog( "close" )',3000);
					}else{
						modalAlert("Surgi&oacute; un error, puede volver a intentarlo");
					}
					break;
				}
				case "sendFile":{

					$( "#dialogAlert" ).dialog( "close" );
					if(res.result=="ack"){
						$( "#dialogSendFile" ).dialog( "close" );

						modalAlert("Env&iacute;o realizado correctamente");
						setTimeout('$( "#dialogAlert" ).dialog( "close" )',3000);
					}else{
						modalAlert("Surgi&oacute; un error, puede volver a intentarlo");
					}
					break;
				}
				case "broadcastDVD":{

					if(res.result=="Bad DVD"){
						modalAlert("Surgi&oacute; un error en la emisi&oacute;n del DVD, puede volver a intentarlo");
					}else if(res.result=="ack"){
						modalAlert("Comienza la emisi&oacute;n del DVD");
						setTimeout('$( "#dialogAlert" ).dialog( "close" )',3000);
					}
					break;
				}
		/*		case "sendMessage":{
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
		error: function ( result ) { 
			modalAlert("Surgi&oacute; un error");
		} 
  });
}
