/*
 * connection.js
 *
 * Copyright (c) 2009-2010 Manu Mora Gordillo <manuito @nospam@ gmail.com>
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 * 
 */

dataRefresh = Ext.util.JSON.encode({"args" : "refresh"});

//Init screens
function initScreens(){
	connection("datosaula",dataRefresh,"pintaaula");
	connection("datosaula",dataRefresh,"pintaconfig");
	setInterval('connection("datosaula","","pintaaula")',REFRESH_CLASSROOM);
}

function sendOrderPC(url,computer,action){

	var classroom = {
		"pclist" : [computer]
	}

	dataStringCommand = Ext.util.JSON.encode(classroom);
	connection(url,dataStringCommand,action);
}

function sendOrderSelected(url,args,action){

	if(dataviewON.getSelectedRecords().length=="0"){
		Ext.Msg.alert('Atención', 'Debe seleccionar al menos un equipo.');
		return;
	}

	var selected = Array();
	for(i=0;i<dataviewON.getSelectedRecords().length;i++){
		selected[i] = dataviewON.getSelectedRecords()[i].get("pcname");
		var name = dataviewON.getSelectedRecords()[i].get("name")

		if(dir=="wakeup" && name=="Apagado"){
			var myMask = new Ext.LoadMask(dataviewON.getSelectedRecords()[i].get("position"), {msg:"Encendiendo"});
			myMask.show();
		}else if(dir=="sleep" && name!="Apagado" && name!="&nbsp;"){
			var myMask = new Ext.LoadMask(dataviewON.getSelectedRecords()[i].get("position"), {msg:"Apagando"});
			myMask.show();
		}
	}	

	var classroom = {
		"pclist" : selected,
		"args" : args
	}

	dataStringCommand = Ext.util.JSON.encode(classroom);
	connection(url,dataStringCommand,action);
}

function sendOrderAll(url,args,action){

	dataviewON.selectRange(0,dataviewON.getNodes().length);

	var selected = Array();
	for(i=0;i<dataviewON.getSelectedRecords().length;i++){
		selected[i] = dataviewON.getSelectedRecords()[i].get("pcname");
	}	

	var classroom = {
		"pclist" : selected,
		"args" : args
	}

	dataString = Ext.util.JSON.encode(classroom);
	connection(url,dataString,action);
}

function sendClassroomConfig(){

	//Tras mover el equipo, obtenemos la nueva configuracion del aula
	var classroom = { "pclist": [], "structure":{"cols":structureClass.cols,"rows":structureClass.rows}};
	var i=0;
	var j=0;

	//Recorremos Columnas y filas para crear el nuevo pclist				
	Ext.getCmp('config').items.each(function(item,index,length){
		if(item.items.length>0){
			this.items.each(function(){									
				var pos = (parseInt(j)*parseInt(structureClass.cols))+parseInt(i);
				classroom.pclist[pos]=this.title;	
                j++
            });
			j=0;		                
			i++;	
		}
    });
	
	// Enviamos la nueva configuracion de los puestos al backend
	dataString = Ext.util.JSON.encode(classroom);				
	connection("classroomConfig",dataString,"cambiaconfig");
}

// Funcion general de connection
function connection(url,data,action){
	Ext.Ajax.request({
		url : url , 
		params : { data : data },
		method: 'POST',
		success: function (result, request) { 
			// distintas respuestas segun la accion enviada
			switch(action){
				case "pintaaula":{
					printClassroom(result.responseText);
					break;
				}
				case "pintaconfig":{
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
				default:{}
			}
		},
		failure: function ( result, request) { 
			//document.getElementById("contenedor").innerHTML += "Error: "+result.responseText+"<br>";
		} 
	});
}
