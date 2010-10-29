/*
 * connection.js
 *
 * Copyright (c) 2009-2010 Manu Mora Gordillo <manuito @nospam@ gmail.com>
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 * 
 */

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
