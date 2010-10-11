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
	var selected = computersSelected();

	if(selected.length==0){
		modalAlert("Para enviar un fichero debe seleccionar al menos un equipo");
		return;
	}

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
				modalConfirm("¿Desea enviar el fichero seleccionado?","sendOrderSelected('sendFile','"+file+"','sendFile');");
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

function modalSendVideo(){

	var selected = computersSelected();

	if(selected.length==0){
		modalAlert("Para realizar una emisi&oacute;n de v&iacute;deo debe seleccionar al menos un equipo");
		return;
	}

	$("#dialogSendFile")
		.dialog({
			title: "Enviar V&iacute;deo",
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
			script: 'getVideoNodes',
			folderEvent: 'click', 
			expandSpeed: 750, 
			collapseSpeed: 750, 
			multiFolder: false },
			function(file) { 
				modalConfirm("¿Desea comenzar la emisi&oacute;n del v&iacute;deo seleccionado?","sendOrderSelected('broadcast','"+file+"','broadcast');");
		});

	return true;
}

function goToURL(url){

	if(url=="")	
		url=$("#url").val();

	$("#frameWeb").attr("src","http://"+url);
	$("#url").val(url);
}

function modalWeb(){

	goToURL("www.educarex.es");

	$("#dialogWeb")
		.dialog({
			title: "Navegaci&oacute;n Web",
			modal: true,
			width: 950,
			resizable: false,
			buttons: {
				"Enviar Web a seleccionados": function() { sendOrderSelected("launchweb", $("#frameWeb").attr("src"), "launchweb"); },
				"Enviar Web a todos": function() { selectAll(); sendOrderSelected("launchweb", $("#frameWeb").attr("src"), "launchweb"); },
				"Cerrar": function() { $( this ).dialog( "close" ); }
			}
		})
		.dialog('open'); 
	return true;
}
