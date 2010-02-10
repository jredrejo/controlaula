/*
 * conexion.js
 *
 * Copyright (c) 2009-2010 Manu Mora Gordillo <manuito @nospam@ gmail.com>
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 * 
 */

//Pregunta el estado de todos los equipos del aula
function estadoAula(){
	conexion("datosaula","estadoAula","");
}

// Funcion para hacer pruebas
function estadoAulaPruebas(){
	conexion("datosAulaPrueba","estadoAulaPruebas","");
}


//Pregunta el estado de uno o varios equipos del aula
function estadoEquipos(equipos){

	var classroom = { "pcs": []};
	var arrayEquipos = equipos.split(",");

	for(i=0;i<arrayEquipos.length;i++){
		classroom.pcs[i] = { "name": arrayEquipos[i]};
	}

	dataString = JSON.stringify(classroom);

	// Para ejecutarlo cada 5 segundos
	//setInterval('conexion("datosaula","estadoEquipos",dataString)','5000');

	conexion("datosaula","estadoEquipos",dataString);
}

// Enviar Orden a los equipos del aula
function enviarOrdenPuestos(dir,puestos,argumentos){

	var classroom = {
		"pclist" : [puestos],
		"args" : argumentos
	}

	dataString = JSON.stringify(classroom);

	conexion(dir,"enviarOrden",dataString);
}


// Funcion general de conexion
function conexion(dir,accion,datos){

	document.getElementById("contenedor").innerHTML += "Enviando peticion a la URL: <b>"+dir+"</b>";

	if(datos!="")
		document.getElementById("contenedor").innerHTML += " los datos: <b>"+datos+"</b>";

	document.getElementById("contenedor").innerHTML += "<br><br>";

	Ext.Ajax.request({
		url : dir , 
		params : { action : accion, data : datos },
		method: 'POST',
		success: function ( result, request) { 

			// distintas respuestas segun la accion enviada
			switch(accion){
				case "estadoAula":{
					// repintarAula(result.responseText);
					document.getElementById("contenedor").innerHTML += "Ok: "+result.responseText+"<br>";
					break;
				}
				case "estadoAulaPruebas":{
					pintarEquiposAula(result.responseText);
					break;
				}
				case "estadoEquipos":{
					// repintarEquipos(result.responseText);
					document.getElementById("contenedor").innerHTML += "Ok: "+result.responseText+"<br>";
					break;
				}
				case "enviarOrden":{
					document.getElementById("contenedor").innerHTML += "Ok: "+result.responseText+"<br>";
					break;
				}
			}
		},
		failure: function ( result, request) { 
			document.getElementById("contenedor").innerHTML += "Error: "+result.responseText+"<br>";
		} 
	});
}

//##############################################################
//# Funciones de utilidades (en el futuro ira en otro archivo) #
//##############################################################

function pintarEquiposAula(equipos){
	var clase = eval('(' + equipos + ')');
	var alumnos = {"images":[]}	

	for(i=0;i<clase.classroom.pclist.length;i++){

		var nombre = clase.classroom.pclist[i].loginname;
		var foto = clase.classroom.pclist[i].photo;
		var pcname = clase.classroom.pclist[i].PCname;
		var internet="images/pc_none.png";
		var mouse="images/pc_none.png";
		
		if(clase.classroom.pclist[i].PCname=="none"){
			nombre = "Sin equipo";
			foto = "images/pc_none.png";			
		}else if(clase.classroom.pclist[i].ON=="0"){
			nombre = "Apagado";
			foto = "images/pc_apagado.png";
		}else if(clase.classroom.pclist[i].loginname=="unlogin"){
			nombre = "Login";
			foto = "images/pc_no_logueado.png";
		}

		if(clase.classroom.pclist[i].internetEnabled=="1") internet="images/icon_web.png";
		if(clase.classroom.pclist[i].mouseEnabled=="1") mouse="images/icon_mouse.png";

		alumnos.images[i]={"name":nombre,"url":foto,"pcname":pcname,"internet":internet,"mouse":mouse}
	}

	pintarDataView(alumnos,clase.classroom.structure.cols);
	pintarConfiguracionAula(clase);
}

// pintar DataView de alumnos
function pintarDataView(alumnos,cols){
	var myStore = new Ext.data.JsonStore({
		data: alumnos,
		root: 'images',
		fields: ['name','url','pcname','internet','mouse']
	});

	dataviewON.setWidth(130*parseInt(cols));
	panel.setWidth(130*parseInt(cols)+30);
/*	dataviewNet.setWidth(105*parseInt(cols));
	dataviewMouse.setWidth(105*parseInt(cols));*/

    dataviewON.setStore(myStore);
//    dataviewNet.setStore(myStore);
//    dataviewMouse.setStore(myStore);
}

// pintar pantalla de configuracion
function pintarConfiguracionAula(clase){

	var configClass = Ext.getCmp('config');
	
	// creacion dinamica de columnas
	for(i=0;i<clase.classroom.structure.cols;i++){
		eval("var column"+i+"={columnWidth:.16,id:'col"+i+"',style:'padding:10px 0 10px 10px',items:[]}");
		eval("configClass.add("+i+",column"+i+")");
	}
	configClass.doLayout();

	// añadimos los equipos a cada columna
	for(i=0;i<clase.classroom.pclist.length;i++){
		
		var nombre = clase.classroom.pclist[i].loginname;
		var foto = clase.classroom.pclist[i].photo;

		if(clase.classroom.pclist[i].PCname=="none"){
			nombre = "Sin equipo";
			foto = "images/pc_none.png";			
		}else if(clase.classroom.pclist[i].ON=="0"){
			nombre = "Apagado";
			foto = "images/pc_apagado.png";
		}else if(clase.classroom.pclist[i].loginname=="unlogin"){
			nombre = "Login";
			foto = "images/pc_no_logueado.png";
		}
		
		var computer={
	       	title: nombre,
	        tools: tools,
	        html: '<div style="text-align:center;"><img src="'+foto+'" style="height:50px;"/></div>'
	   }
	   
	   var queColumna = parseInt(i) % parseInt(clase.classroom.structure.cols);
	   var posicionEnColumna = parseInt(i) / parseInt(clase.classroom.structure.cols);
	   eval("column"+parseInt(queColumna)+".items["+parseInt(posicionEnColumna)+"] = computer;");
		
	   var colTMP = Ext.getCmp('col'+parseInt(queColumna));
	   colTMP.add(computer);
	   colTMP.doLayout();
	  
	   //alert("col: "+parseInt(queColumna)+" - row: "+parseInt(posicionEnColumna)+" - pc: "+i);
	}
}
