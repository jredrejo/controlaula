/* #########################################################################
# Project:     Controlaula
# Module:     	utils.js
# Purpose:     Util functions
# Language:    javascript
# Copyright:   2009-2010 - Manuel Mora Gordillo <manuito @nospam@ gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
# 
############################################################################## */

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
				$("#"+item.id+" .thumb-image").attr("src","img/icon_loading.gif");
				$("#"+item.id).removeClass("ui-selected");
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

function setColsRows(cols,rows){

	$("#sliderRows").slider("value",rows);
	$("#rows").val(rows);

	$("#sliderColumns").slider("value",cols);
	$("#columns").val(cols);

	$("#selectable").css("width",cols*96);
	$("#sortable").css("width",cols*96);
}

function setMaxComputers(){
	var maxComputers = parseInt($("#sliderColumns").slider("value")) * parseInt($("#sliderRows").slider("value"));

	var afterMax = $("#sliderComputers").slider("option","max");

	$("#sliderComputers").slider("option","max",maxComputers);

	if(parseInt($("#numComputers").val())>=parseInt(maxComputers) || afterMax==$("#numComputers").val()){
		$("#numComputers").val(maxComputers);
		$("#sliderComputers").slider("value",maxComputers);
	}
}

function setComputers(computers){

	$("#numComputers").val(computers);
	$("#sliderComputers").slider("value",computers);

	setMaxComputers();
}

/* function setComputers(){
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
}*/
