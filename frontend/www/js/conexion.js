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

	for(i=0;i<4;i++){

		var nombre = clase.classroom.pclist[i].loginname;
		var foto = clase.classroom.pclist[i].photo;

		if(clase.classroom.pclist[i].ON=="0"){
			nombre = "Apagado";
			foto = "images/pc_apagado.png";
		}else if(clase.classroom.pclist[i].loginname=="unlogin"){
			nombre = "Login";
			foto = "images/pc_no_logueado.png";
		}

		alumnos.images[i]={"name":nombre,"url":foto}
	}

	pintarDataView(alumnos);
	pintarConfiguracionAula(clase);
}

// pintar DataView de alumnos
function pintarDataView(alumnos){
	var myStore = new Ext.data.JsonStore({
		data: alumnos,
		root: 'images',
		fields: ['name','url']
	});

    dataviewON.setStore(myStore);
    //dataviewNet.setStore(myStore);
   // dataviewMouse.setStore(myStore);
}

// pintar pantalla de configuracion
function pintarConfiguracionAula(clase){

	// creacion dinamica de columnas
	for(i=0;i<clase.classroom.structure.cols;i++){
		eval("var column"+i+"={columnWidth:.16,style:'padding:10px 0 10px 10px',items:[]}");
	}

	// añadimos los equipos a cada columna
	for(i=0;i<clase.classroom.pclist.length;i++){
		var computer={
	       	title: clase.classroom.pclist[i].loginname,
	        tools: tools,
	        html: '<div style="text-align:center;"><img src="'+clase.classroom.pclist[i].photo+'" style="height:50px;"/></div>'
	   }
	   
	   var queColumna = parseInt(i) % parseInt(clase.classroom.structure.cols);
	   var posicionEnColumna = parseInt(i) / parseInt(clase.classroom.structure.cols);
	   eval("column"+parseInt(queColumna)+".items["+parseInt(posicionEnColumna)+"] = computer;");
	   
	   //alert("col: "+parseInt(queColumna)+" - row: "+parseInt(posicionEnColumna)+" - pc: "+i);
	}

//alert(	JSON.stringify(column1));


	// Ahora tenemos que agregar las columnas al portal

}
