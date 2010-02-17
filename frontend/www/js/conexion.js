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

	dataString = Ext.util.JSON.encode({"args" : "refresh"});

	conexion("datosaula",dataString,"pintaaula");
	setInterval('conexion("datosaula","","pintaaula")','5000');
}

function estadoAulaConfig(){

	dataString = Ext.util.JSON.encode({"args" : "refresh"});

	conexion("datosaula",dataString,"pintaconfig");
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
function enviarOrdenPuestos(dir,puestos,argumentos){

	var classroom = {
		"pclist" : [puestos],
		"args" : argumentos
	}

	dataString = Ext.util.JSON.encode(classroom);
	conexion(dir,dataString,"cambiaconfig");
}


// Funcion general de conexion
function conexion(dir,datos,accion){

	/*document.getElementById("contenedor").innerHTML += "Enviando peticion a la URL: <b>"+dir+"</b>";

	if(datos!="")
		document.getElementById("contenedor").innerHTML += " los datos: <b>"+datos+"</b>";

	document.getElementById("contenedor").innerHTML += "<br><br>";*/

	Ext.Ajax.request({
		url : dir , 
		params : { data : datos },
		method: 'POST',
		success: function ( result, request) { 
			// distintas respuestas segun la accion enviada
			switch(accion){
				case "pintaaula":{
				//	document.getElementById("contenedor").innerHTML += "Ok: "+result.responseText+"<br>";
					pintarDataView(result.responseText);
					break;
				}
				case "pintaconfig":{
				//	document.getElementById("contenedor").innerHTML += "Ok: "+result.responseText+"<br>";
					pintarConfiguracionAula(result.responseText);
					break;
				}
				case "cambiaconfig":{
					conexion("datosaula","","pintaaula");
					break;
				}
				default:{
					// repintarEquipos(result.responseText);
					//document.getElementById("contenedor").innerHTML += "Ok: "+result.responseText+"<br>";
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

// pintar DataView de alumnos
function pintarDataView(equipos){

	var clase = eval('(' + equipos + ')');
	var alumnos = {"images":[]};
	var cols = clase.classroom.structure.cols;
	var seleccionados = dataviewON.getSelectedIndexes();

	if(clase.classroom.pclist.length==0)
		return;

	for(i=0;i<clase.classroom.pclist.length;i++){

		var nombre = clase.classroom.pclist[i].loginname;
		var foto = clase.classroom.pclist[i].photo;
		var pcname = clase.classroom.pclist[i].PCname;
		var internet=mouse=message="images/pc_none.png";
		
		if(clase.classroom.pclist[i].PCname=="none"){
			nombre = "None";
			foto = "images/pc_none.png";			
		}else if(clase.classroom.pclist[i].ON=="0"){
			nombre = "Apagado";
			foto = "images/pc_apagado.png";
		}else if(clase.classroom.pclist[i].loginname=="" && clase.classroom.pclist[i].ON=="1"){
			nombre = "Login";
			foto = "images/pc_no_logueado.png";
		}

		if(clase.classroom.pclist[i].internetEnabled=="1") internet="images/icon_web.png";
		if(clase.classroom.pclist[i].mouseEnabled=="1") mouse="images/icon_mouse.png";
		if(clase.classroom.pclist[i].messagesEnabled=="1") message="images/icon_messages.png";

		alumnos.images[i]={"name":nombre,"url":foto,"pcname":pcname,"internet":internet,"mouse":mouse,"message":message}
	}	

	var myStore = new Ext.data.JsonStore({
		data: alumnos,
		root: 'images',
		fields: ['name','url','pcname','internet','mouse','message']
	});

	var sizeDataview = 130*parseInt(cols);
	var sizePanel = 130*parseInt(cols)+30;

	if(parseInt(sizePanel)<470)
		sizePanel=470;

	dataviewON.setWidth(sizeDataview);
	panel.setWidth(sizePanel);
   dataviewON.setStore(myStore);
	dataviewON.select(seleccionados);
}

// pintar pantalla de configuracion
function pintarConfiguracionAula(equipos){

	var clase = eval('(' + equipos + ')');

	structureClass.cols=clase.classroom.structure.cols;
	structureClass.rows=clase.classroom.structure.rows;
	
	var configClass = Ext.getCmp('config');
	configClass.removeAll();

	// creacion dinamica de columnas
	for(i=0;i<clase.classroom.structure.cols;i++){
		eval("var column"+i+"={id:'col"+i+"',columnWidth:.16,style:'padding:10px 0 10px 10px',items:[]}");
		eval("configClass.add("+i+",column"+i+")");
	}
	configClass.doLayout();
	
	// añadimos los equipos a cada columna
   for(i=0;i<clase.classroom.pclist.length;i++){
		
		var nombre = clase.classroom.pclist[i].loginname;
		var foto = clase.classroom.pclist[i].photo;
		var pcname = clase.classroom.pclist[i].PCname;
		
		if(clase.classroom.pclist[i].PCname=="none"){
			pcname = "None";
			foto = "images/pc_none.png";			
			nombre="&nbsp;";
		}else if(clase.classroom.pclist[i].ON=="0"){
			nombre="Apagado";
			foto = "images/pc_apagado.png";
		}else if(clase.classroom.pclist[i].loginname=="" && clase.classroom.pclist[i].ON=="1"){
			nombre = "Login";
			foto = "images/pc_no_logueado.png";
		}

	   var queColumna = parseInt(i) % parseInt(clase.classroom.structure.cols);
	   var posicionEnColumna = parseInt(i) / parseInt(clase.classroom.structure.cols);
		
		var computer={
	       	title: pcname,
	        tools: tools,
	        html: '<div style="text-align:center;"><img src="'+foto+'" style="height:50px;"/><br><b>'+nombre+'</b></div>'
	   }
	   
	   eval("column"+parseInt(queColumna)+".items["+parseInt(posicionEnColumna)+"] = computer;");
		
	   var colTMP = Ext.getCmp('col'+parseInt(queColumna));
	   colTMP.add(computer);
	   colTMP.doLayout();
	}
}
