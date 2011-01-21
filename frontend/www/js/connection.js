/* #########################################################################
# Project:     Controlaula
# Module:     	connection.js
# Purpose:     Connection with the backend
# Language:    javascript
# Copyright:   2009-2010 - Manuel Mora Gordillo <manuito @nospam@ gmail.com>
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
############################################################################## */
var dataRefresh = $.JSON.encode({"args" : "refresh"});


var REFRESH_BIGBROTHER = 3000; /* in miliseconds*/
var REFRESH_CLASSROOM = 5000; /* in miliseconds*/

var intervalBigBrother;

//Init screens
function initScreens(){
	connection("datosaula",dataRefresh,"printClassroom");
	//setInterval('connection("datosaula","","refreshClassroom")',REFRESH_CLASSROOM);
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
				case "gettheme":{
				  $('head').append('<link href="js/jquery/ui/css/'+ res +'/jquery-ui-1.8.8.custom.css" rel="Stylesheet" type="text/css" />');
					break;
				}
				case "printClassroom":{
					printClassroom(result);
					connection("datosaula","","refreshClassroom");
					break;
				}
				case "refreshClassroom":{
					refreshClassroom(result);
					connection("datosaula","","refreshClassroom");
					break;
				}
				case "cambiaconfig":{
					//connection("datosaula","","refreshClassroom");
					break;
				}
				case "translate":{
					translate(res);
					break;
				}
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

					}else{
						modalAlert("Surgi&oacute; un error, puede volver a intentarlo");
					}
					break;
				}
				case "broadcastDVD":{

					switch(res.result){
						case "Bad DVD":{
							modalAlert("Surgi&oacute; un error en la emisi&oacute;n del DVD, puede volver a intentarlo");
							break;
						}
						case "NODISK":{
							modalAlert("No se ha detectado ning&uacute;n DVD insertado");
							break;
						}
						case "ack":{
							$( "#dialogSendFile" ).dialog( "close" );

							modalAlert("Comienza la emisi&oacute;n del DVD");
							setTimeout('$( "#dialogAlert" ).dialog( "close" )',3000);
							break;
						}
						default:{
							modalSendVideo(res.result);
							break;
						}
					}
					break;
				}
				case "sendMessage":{

					if(res.result=="Bad send"){
						modalAlert("Surgi&oacute; un error en el env&iacute;o del mensaje, puede volver a intentarlo");
					}else if(res.result=="ack"){
						modalAlert("El env&iacute;o del mensaje se ha realizado correctamente");
						setTimeout('$( "#dialogAlert" ).dialog( "close" )',2500);
					}
					break;
				}
				case "launchweb":{

					if(res.result=="Bad send"){
						modalAlert("Surgi&oacute; un error en el env&iacute;o del mensaje, puede volver a intentarlo");
					}else if(res.result=="ack"){
						modalAlert("Se ha enviado la web correctamente");
						setTimeout('$( "#dialogAlert" ).dialog( "close" )',1000);
					}
					break;
				}
				case "bigbrother":{
					connection("getCaptures","","getCaptures");
					break;
				}
				case "getCaptures":{
					printBigBrother(res);
					connection("getCaptures","","refreshCaptures");
					break;
				}
				case "refreshCaptures":{
					refreshBigBrother(res);
					intervalBigBrother = setTimeout('connection("getCaptures","","refreshCaptures");',REFRESH_BIGBROTHER);
					break;
				}
				case "disableBigBrother":{
					clearInterval(intervalBigBrother);
					break;
				}
			}
		},
      error:function (result){
			if(url!="errorLog"){
				modalAlert("Surgi&oacute; un error");
				setTimeout('$( "#dialogAlert" ).dialog( "close" )',1000);

				var errorData = $.JSON.encode({"args" : url+": "+result.status+" "+result.statusText});
				connection("errorLog",errorData,"");
			}
		} 
  });
}
