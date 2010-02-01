
//Pregunta el estado de todos los equipos del aula
function estadoAula(){
	conexion("datosaula","estadoAula","");
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

	document.getElementById("contenedor").innerHTML += "Enviando a la URL: <b>"+dir+"</b> los datos: <b>"+datos+"</b><br>";

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
