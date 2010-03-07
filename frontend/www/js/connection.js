/*
 * connection.js
 *
 * Copyright (c) 2009-2010 Manu Mora Gordillo <manuito @nospam@ gmail.com>
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 * 
 */

dataRefresh = Ext.util.JSON.encode({"args" : "refresh"});

//Pregunta el estado de todos los equipos del aula
function initScreens(){
	conexion("datosaula",dataRefresh,"pintaaula");
	conexion("datosaula",dataRefresh,"pintaconfig");
	setInterval('conexion("datosaula","","pintaaula")','5000');

/*	conexion("datosAulaPrueba",dataRefresh,"pintaaula");
	setInterval('conexion("datosAulaPrueba",dataRefresh,"pintaaula")','5000');*/
}

//Pregunta el estado de uno o varios equipos del aula
function estadoEquipos(equipos){

	var classroom = { "pcs": []};
	var arrayEquipos = equipos.split(",");

	for(i=0;i<arrayEquipos.length;i++){
		classroom.pcs[i] = { "name": arrayEquipos[i]};
	}

	dataString = Ext.util.JSON.encode(classroom);

	// Para ejecutarlo cada 5 segundos
	//setInterval('conexion("datosaula",dataString,"pintaaula")','5000');

	conexion("datosaula",dataString,"pintaaula");
}

// Enviar Orden a los equipos del aula
function enviarOrdenSeleccionados(dir,argumentos,action){

	if(dataviewON.getSelectedRecords().length=="0"){
		Ext.Msg.alert('Atención', 'Debe seleccionar al menos un equipo.');
		return;
	}

	var seleccionados = Array();
	for(i=0;i<dataviewON.getSelectedRecords().length;i++){
		seleccionados[i] = dataviewON.getSelectedRecords()[i].get("pcname");
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
		"pclist" : seleccionados,
		"args" : argumentos
	}

	dataStringCommand = Ext.util.JSON.encode(classroom);
	conexion(dir,dataStringCommand,action);
}

// Enviar Orden a los equipos del aula
function enviarOrdenTodos(dir,argumentos,action){

	dataviewON.selectRange(0,dataviewON.getNodes().length);

	var seleccionados = Array();
	for(i=0;i<dataviewON.getSelectedRecords().length;i++){
		seleccionados[i] = dataviewON.getSelectedRecords()[i].get("pcname");
	}	

	var classroom = {
		"pclist" : seleccionados,
		"args" : argumentos
	}

	dataString = Ext.util.JSON.encode(classroom);
	conexion(dir,dataString,action);
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
	conexion("classroomConfig",dataString,"cambiaconfig");
}

// Funcion general de conexion
function conexion(dir,datos,accion){
	Ext.Ajax.request({
		url : dir , 
		params : { data : datos },
		method: 'POST',
		success: function (result, request) { 
			// distintas respuestas segun la accion enviada
			switch(accion){
				case "pintaaula":{
					pintarDataView(result.responseText);
					break;
				}
				case "pintaconfig":{
					pintarConfiguracionAula(result.responseText);
					break;
				}
				case "cambiaconfig":{
					conexion("datosaula","","pintaaula");
					break;
				}
				case "broadcastVideo":{
					resultJSON = Ext.util.JSON.decode(result.responseText);

					switch(resultJSON.result){
						case "Bad file":{ Ext.Msg.alert('Atención', 'Archivo de video incorrecto.'); break; }
						case "Bad DVD":{ Ext.Msg.alert('Atención', 'DVD incorrecto.'); break; }
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
