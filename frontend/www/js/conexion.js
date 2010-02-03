
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

	document.getElementById("contenedor").innerHTML += "Datos recibidos del backend:<br><b>"+equipos+"</b><br><br>";	

	var clase = eval('(' + equipos + ')');

	var alumnos = {"images":[]}	
	for(i=0;i<2;i++){
		alumnos.images[i]={"name":clase.classroom[i].loginname,"url":clase.classroom[i].photo}
	}

	dataString = JSON.stringify(alumnos);

	document.getElementById("contenedor").innerHTML += "Tras parsearla nos queda:<br><b>"+dataString+"</b><br><br>";	

	// Ahora tenemos que almacenarlo en DataView
	// Para ello nos creamos un objeto Store, insertamos el json y lo almacenamos en el DataView

/*	var myStore = new Ext.data.Store();
	myStore.loadData(alumnos);

	alumnosAula.setStore(myStore);*/
}
