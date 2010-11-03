function modalAlert(message){

	$("#dialogAlertMessage").html(message);

	$("#dialogAlert")
		.dialog({
			modal: true,
			width: 350,
			resizable: false,
			hide: "explode",
			buttons: {
				Ok: function() { $( this ).dialog( "close" ); }
			}
		})
		.dialog('open'); 

	return true;
}

function modalConfirm(message, funct){

	$("#dialogAlertMessage").html(message);

	$("#dialogAlert")
		.dialog({
			modal: true,
			width: 350,
			resizable: false,
			buttons: {
				"Si": function() { eval(funct); },
				"No": function() { $( this ).dialog( "close" ); }
			}
		})
		.dialog('open'); 

	return true;
}

function modalSendFile(){

	$("#dialogSendFile")
		.dialog({
			title: "Enviar Fichero",
			modal: true,
			width: 550,
			resizable: false,
			buttons: {
				"Cerrar": function() { $( this ).dialog( "close" ); }
			}
		})
		.dialog('open'); 

		$('#sendFileTree').fileTree({
			root: 'home', 
			script: 'getAllNodes',
			folderEvent: 'click', 
			expandSpeed: 750, 
			collapseSpeed: 750, 
			multiFolder: false },
			function(file) { 
				modalConfirm("¿Desea enviar el fichero seleccionado?","sendOrder('sendFile','"+file+"','sendFile');");
		});

	return true;
}

function modalReceivedFiles(){

	$("#dialogSendFile")
		.dialog({
			title: "Ficheros Recibidos",
			modal: true,
			width: 550,
			resizable: false,
			buttons: {
				"Abrir Carpeta Recibidos": function() { sendOrder('openFile','dirReceivedTeacher','openFile'); },
				"Cerrar": function() { $( this ).dialog( "close" ); }
			}
		})
		.dialog('open'); 

		$('#sendFileTree').fileTree({
			root: 'receivedFiles', 
			script: 'getAllNodes',
			folderEvent: 'click', 
			expandSpeed: 750, 
			collapseSpeed: 750, 
			multiFolder: false },
			function(file) { 
				sendOrder('openFile',file,'openFile');
		});

	return true;
}

function modalSendMessage(){
	var selected = computersSelected();

	if(selected.length==0){
		modalAlert("Para enviar un mensaje debe seleccionar al menos un equipo");
		return;
	}

	$("#message").val("");

	$("#dialogSendMessage")
		.dialog({
			title: "Enviar Mensaje",
			modal: true,
			width: 550,
			resizable: false,
			buttons: {
				"Enviar": function() { 
					if($("#message").val()=="")
						modalAlert("Debe escribir un mensaje");
					else
						sendOrderSelected("sendMessage",$("#message").val(),"sendMessage");
				},
				"Cerrar": function() { $( this ).dialog( "close" ); }
			}
		})
		.dialog('open'); 

	return true;
}
