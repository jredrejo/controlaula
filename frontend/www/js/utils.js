/*
 * utils.js
 *
 * Copyright (c) 2009-2010 Manu Mora Gordillo <manuito @nospam@ gmail.com>
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 * 
 */


// Print DataView classroom
function printClassroom(equipos){

	var class = eval('(' + equipos + ')');

	if(class.classroom.pclist.length==0)
		return;
//alert(class.classroom.structure.rows+" - "+class.classroom.structure.cols);

	setColsRows(class.classroom.structure.cols, class.classroom.structure.rows);

	//$('#selectable .ui-state-default').remove();

	for(var i=0;i<class.classroom.pclist.length;i++){

		var name = class.classroom.pclist[i].loginname;
		var photo = class.classroom.pclist[i].photo;
		var pcname = class.classroom.pclist[i].PCname;
		var internet=mouse=message="img/pcNone.png";
		
		if(class.classroom.pclist[i].PCname=="none"){
			pcname = "&nbsp;";
			name = "&nbsp;";
			photo = "img/pcNone.png";			
		}else if(class.classroom.pclist[i].ON=="0"){
			name = "Apagado";
			photo = "img/turnOff.png";
		}else if(class.classroom.pclist[i].loginname=="" && class.classroom.pclist[i].ON=="1"){
			name = "Login";
			photo = "img/turnOn.png";
		}

		if(class.classroom.pclist[i].internetEnabled=="1") internet="img/icon_web.png";
		if(class.classroom.pclist[i].mouseEnabled=="1") mouse="img/icon_mouse.png";
		if(class.classroom.pclist[i].messagesEnabled=="1") message="img/icon_messages.png";

		$('#selectable').append('<li class="ui-state-default" id="selectable-'+i+'"><div id="pcName">'+pcname+'</div><img class="thumb-image" src="'+photo+'"/><div id="userName">'+name+'</div></li>');
		$('#sortable').append('<li class="ui-state-default" id="sortable-'+i+'"><div id="pcName">'+pcname+'</div><img class="thumb-image" src="'+photo+'"/><div id="userName">'+name+'</div></li>');
	}	
	lastPClist = class.classroom.pclist;
}

function refreshClassroom(equipos){
	var class = eval('(' + equipos + ')');

	if(class.classroom.pclist.length==0)
		return;

	//$('#selectable .ui-state-default').remove();

	for(var i=0;i<class.classroom.pclist.length;i++){

		var name = class.classroom.pclist[i].loginname;
		var photo = class.classroom.pclist[i].photo;
		var pcname = class.classroom.pclist[i].PCname;
		var internet=mouse=message="img/pcNone.png";
		
		if(class.classroom.pclist[i].PCname=="none"){
			pcname = "&nbsp;";
			name = "&nbsp;";
			photo = "img/pcNone.png";			
		}else if(class.classroom.pclist[i].ON=="0"){
			name = "Apagado";
			photo = "img/turnOff.png";
		}else if(class.classroom.pclist[i].loginname=="" && class.classroom.pclist[i].ON=="1"){
			name = "Login";
			photo = "img/turnOn.png";
		}

		if(class.classroom.pclist[i].internetEnabled=="1") internet="img/icon_web.png";
		if(class.classroom.pclist[i].mouseEnabled=="1") mouse="img/icon_mouse.png";
		if(class.classroom.pclist[i].messagesEnabled=="1") message="img/icon_messages.png";

		var refresh = '<img src="'+photo+'"/>'+name;

/*		if($('#selectable #selectable-'+i).html()!=refresh){
			$('#selectable #selectable-'+i).remove();
			$('#selectable').append('<li class="ui-state-default" id="selectable-'+i+'">'+refresh+'</li>');
		}*/
		$('#selectable #selectable-'+i).remove();
		$('#sortable #sortable-'+i).remove();

		$('#selectable').append('<li class="ui-state-default" id="selectable-'+i+'"><div id="pcName">'+pcname+'</div><img class="thumb-image" src="'+photo+'"/><div id="userName">'+name+'</div></li>');
		$('#sortable').append('<li class="ui-state-default" id="sortable-'+i+'"><div id="pcName">'+pcname+'</div><img class="thumb-image" src="'+photo+'"/><div id="userName">'+name+'</div></li>');

	}
	lastPClist = class.classroom.pclist;
}

function selectAll(){
	$("#tabsClassroom").tabs("select","tabsClassroom-1");
	$("#selectable li").addClass("ui-selected");
}

function selectNone(){
	$("#tabsClassroom").tabs("select","tabsClassroom-1");
	$("#selectable li").removeClass("ui-selected");
}

function computersSelected(){
	var selected = Array();
	var i=0;
	
	$("#selectable li").each(function(i, item){
		if($("#"+item.id).hasClass('ui-selected')==true){
			selected[i] = $("#"+item.id+" #pcName").html();
			i++;
		}
	});
	return selected;
}

function sendOrderSelected(url,args,action){

	var selected = computersSelected();

	if(selected.length==0){
		modalAlert("Para realizar la acci&oacute;n debe seleccionar al menos un equipo");
		return;
	}

	var classroom = {
		"pclist" : selected,
		"args" : args
	}

	var dataString = $.JSON.encode(classroom)
	connection(url,dataString,action);
}

function sendClassroomConfig(){

	var computers = Array();
	var i=0;

	//var computers = $("#sortable").sortable( "toArray" );

	setColsRows($("#sliderColumns").slider("value"),$("#sliderRows").slider("value"));

	$("#sortable li").each(function(i, item){
			computers[i] = $("#"+item.id+" #pcName").html();
			i++;
	});

	var classroom = {
		"pclist": computers, 
		"structure":{
			"cols": $("#sliderColumns").slider("value"),
			"rows": $("#sliderRows").slider("value")
		}
	};

	var dataString = $.JSON.encode(classroom)
	connection("classroomConfig",dataString,"cambiaconfig");
}

function setColsRows(cols,rows){

	$("#sliderRows").slider("value",rows);
	$("#rows").val(rows);

	$("#sliderColumns").slider("value",cols);
	$("#columns").val(cols);

	$("#selectable").css("width",cols*100);
	$("#sortable").css("width",cols*100);

	//setComputers();
}

function setComputers(){
	var count = $("#sliderComputers").slider("value")-$("#sortable li").length;

	if(count>0){
		for(i=$("#sortable li").length; i<$("#sliderComputers").slider("value"); i++){
			$('#selectable').append('<li class="ui-state-default" id="selectable-'+i+'"><div id="pcName">Unknown</div><img src="img/turnOff.png"/><div id="userName">Apagado</div></li>');
			$('#sortable').append('<li class="ui-state-default" id="sortable-'+i+'"><div id="pcName">Unknown</div><img src="img/turnOff.png"/><div id="userName">Apagado</div></li>');
		}
	}else if(count<0){
		for(i=$("#sortable li").length;i>$("#sliderComputers").slider("value");i--){
			$('#selectable').remove("#selectable-"+i);
			$('#sortable').remove("#sortable-"+i);
		}
	}
}

function modalAlert(message){

	$("#dialogAlertMessage").html(message);

	$("#dialogAlert")
		.dialog({
			modal: true,
			width: 350,
			resizable: false,
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
			root: '/home', 
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
			root: '/home', 
			script: 'getVideoNodes',
			folderEvent: 'click', 
			expandSpeed: 750, 
			collapseSpeed: 750, 
			multiFolder: false },
			function(file) { 
				modalConfirm("¿Desea enviar el v&iacute;deo seleccionado?","sendOrderSelected('broadcast','"+file+"','broadcast');");
		});

	return true;
}

function printInterface(){
		$("#tabsComputers").tabs();
		$("#tabsActions").tabs();
		$("#tabsClassroom").tabs();

		$("#selectable").selectable();

		$("#sortable").sortable({
			stop: function(event, ui) { 
				sendClassroomConfig();
			}
		});

		$("#sortable").disableSelection();
}

function printSliders(){
		$("#sliderRows").slider({
			min: 1,
			max: 8,
			step: 1,
			slide: function(event, ui) {
				$("#rows").val(ui.value);
			}
		});

		$("#sliderColumns").slider({
			min: 1,
			max: 5,
			step: 1,
			slide: function(event, ui) {
				$("#columns").val(ui.value);
			}
		});

		$("#sliderComputers").slider({
			value:15,
			min: 1,
			max: 30,
			step: 1,
			slide: function(event, ui) {
				$("#computers").val(ui.value);
			}
		});
		$("#computers").val($("#sliderComputers").slider("value"));
}
