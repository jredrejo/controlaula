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

function connection(url,data,action){

	if(url=="datosaula" && data!=dataRefresh)
		var data = $.JSON.encode({"args" : lastPClist});

	datatosent=new Object();
	datatosent.data=data;
    datatosent.user_id=conf.userName;

	$.ajax({ 
		url : url , 
		type: 'POST',
		data : datatosent,
		success: function (result) { 
			var res = $.parseJSON(result);

			switch(action){
				case "sendFile":{

					$( "#dialogAlert" ).dialog( "close" );
					if(res.result=="ack"){

					}else{
						modalAlert("Surgi&oacute; un error, puede volver a intentarlo");
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

function sendOrder(url,args,action){

	var classroom = {
		"args" : args
	}

	var dataString = $.JSON.encode(classroom);
	connection(url,dataString,action);
}
