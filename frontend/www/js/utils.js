/*
 * utils.js
 *
 * Copyright (c) 2009-2010 Manu Mora Gordillo <manuito @nospam@ gmail.com>
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 * 
 */

function selectAll(){
	$("#tabsClassroom").tabs("select","tabsClassroom-1");
	$("#selectable li").addClass("ui-selected");
}

function selectNone(){
	$("#tabsClassroom").tabs("select","tabsClassroom-1");
	$("#selectable li").removeClass("ui-selected");
}

function computersSelected(url){
	var selected = Array();
	var i=0;
	
	$("#selectable li").each(function(i, item){
		if($("#"+item.id).hasClass('ui-selected')==true){
			selected[i] = $("#"+item.id + ":eq(0) > #pcName").html();
			i++;

			if(url=="wakeup"){
				$("#"+item.id + " img").attr("src","img/icon_loading.gif");
			}
		}
	});
	return selected;
}

function sendOrderSelected(url,args,action){

	var selected = computersSelected(url);

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

function sendOrder(url,args,action){

	var classroom = {
		"args" : args
	}

	var dataString = $.JSON.encode(classroom);
	connection(url,dataString,action);
}

function sendClassroomConfig(){

	var computers = Array();
	var i=0;

	//var computers = $("#sortable").sortable( "toArray" );

	setColsRows($("#sliderColumns").slider("value"),$("#sliderRows").slider("value"));

	$("#sortable li").each(function(i, item){
            computers[i] = $("#"+item.id + ":eq(0) > #pcName").html();            
			i++;
	});

	var classroom = {
		"pclist": computers, 
		"structure":{
			"cols": $("#sliderColumns").slider("value"),
			"rows": $("#sliderRows").slider("value"),
			"computers": $("#sliderComputers").slider("value")
		}
	};

	var dataString = $.JSON.encode(classroom)
	connection("classroomConfig",dataString,"cambiaconfig");
}

function setMaxComputers(){
	var maxComputers = parseInt($("#sliderColumns").slider("value")) * parseInt($("#sliderRows").slider("value"));

	var afterMax = $("#sliderComputers").slider("option","max");

	$("#sliderComputers").slider("option","max",maxComputers);

	if(parseInt($("#computers").val())>parseInt(maxComputers) || afterMax==$("#computers").val()){
		$("#sliderComputers").slider("value",maxComputers);
		$("#computers").val(maxComputers);
	}
}

function setColsRows(cols,rows){

	$("#sliderRows").slider("value",rows);
	$("#rows").val(rows);

	$("#sliderColumns").slider("value",cols);
	$("#columns").val(cols);

	$("#selectable").css("width",cols*96);
	$("#sortable").css("width",cols*96);

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
