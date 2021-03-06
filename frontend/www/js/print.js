/* #########################################################################
# Project:     Controlaula
# Module:     	print.js
# Purpose:     Print interface functions
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
var translations

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
			},
			stop: function(event, ui) {
				setMaxComputers();
			}
		});

		$("#sliderColumns").slider({
			min: 1,
			max: 6,
			step: 1,
			slide: function(event, ui) {
				$("#columns").val(ui.value);
			},
			stop: function(event, ui) {
				setMaxComputers();
			}
		});

		$("#sliderComputers").slider({
			min: 1,
			max: 30,
			step: 1,
			slide: function(event, ui) {
				$("#numComputers").val(ui.value);
			}
		});
		$("#numComputers").val($("#sliderComputers").slider("value"));
}

function printClassroom(equipos){

	var myclass = eval('(' + equipos + ')');

	if(myclass.classroom.pclist.length==0)
		return;
//alert(myclass.classroom.structure.rows+" - "+myclass.classroom.structure.cols);

	setColsRows(myclass.classroom.structure.cols, myclass.classroom.structure.rows);   
	setComputers(myclass.classroom.structure.computers);

	//$('#selectable .ui-state-default').remove();

	for(var i=0;i<myclass.classroom.pclist.length;i++){

		var name = myclass.classroom.pclist[i].loginname;
		var photo = myclass.classroom.pclist[i].photo;
		var pcname = myclass.classroom.pclist[i].PCname;
		var internet=mouse=message="img/pcNone.png";
		
		if(myclass.classroom.pclist[i].PCname=="none"){
			pcname = "&nbsp;";
			name = "&nbsp;";
			photo = "img/pcNone.png";			
		}else if(myclass.classroom.pclist[i].ON=="0"){
			name =  translations["Off"];
			photo = "img/turnOff.png";
		}else if(myclass.classroom.pclist[i].loginname=="" && myclass.classroom.pclist[i].ON=="1"){
			name = "Login";
			photo = "img/turnOn.png";
		}

		if(myclass.classroom.pclist[i].internetEnabled=="1") internet="img/icon_web.png";
		if(myclass.classroom.pclist[i].mouseEnabled=="1") mouse="img/icon_mouse.png";
		if(myclass.classroom.pclist[i].messagesEnabled=="1") message="img/icon_messages.png";

		$('#selectable').append('<li class="ui-state-default" id="selectable-'+i+'"><div id="pcName">'+pcname+'</div><div style="float:right;"><img src="'+internet+'" style="width:20px; height:20px;"><br><img src="'+mouse+'" style="padding-top:3px; width:20px; height:20px;"><br><img src="'+message+'" style="padding-top:0px; width:20px; height:20px;"></div><img class="thumb-image" src="'+photo+'"/><div id="userName">'+name+'</div></li>');
		//$('#selectable').append('');
//		$('#selectable').append('');

		$('#sortable').append('<li class="ui-state-default" id="sortable-'+i+'"><div id="pcName">'+pcname+'</div><img class="thumb-image" src="'+photo+'"/><div id="userName">'+name+'</div></li>');
	}	
	lastPClist = myclass.classroom.pclist;
}

function refreshClassroom(equipos){
	var myclass = eval('(' + equipos + ')');

	if(myclass.classroom.pclist.length==0)
		return;

    var selected = computersSelected("nothing");          
                
    
	for(var i=0;i<myclass.classroom.pclist.length;i++){

		var name = myclass.classroom.pclist[i].loginname;
		var photo = myclass.classroom.pclist[i].photo;
		var pcname = myclass.classroom.pclist[i].PCname;
		var internet=mouse=message="img/pcNone.png";
		
		if(myclass.classroom.pclist[i].PCname=="none"){
			pcname = "&nbsp;";
			name = "&nbsp;";
			photo = "img/pcNone.png";			
		}else if(myclass.classroom.pclist[i].ON=="0"){
			name = translations["Off"];
			photo = "img/turnOff.png";
		}else if(myclass.classroom.pclist[i].loginname=="" && myclass.classroom.pclist[i].ON=="1"){
			name = "Login";
			photo = "img/turnOn.png";
		}

		if(myclass.classroom.pclist[i].internetEnabled=="1") internet="img/icon_web.png";
		if(myclass.classroom.pclist[i].mouseEnabled=="1") mouse="img/icon_mouse.png";
		if(myclass.classroom.pclist[i].messagesEnabled=="1") message="img/icon_messages.png";

		var refresh = '<img src="'+photo+'"/>'+name;

/*		if($('#selectable #selectable-'+i).html()!=refresh){
			$('#selectable #selectable-'+i).remove();
			$('#selectable').append('<li class="ui-state-default" id="selectable-'+i+'">'+refresh+'</li>');
		}*/
		$('#selectable #selectable-'+i).remove();
		$('#sortable #sortable-'+i).remove();

		$('#selectable').append('<li class="ui-state-default" id="selectable-'+i+'"><div id="pcName">'+pcname+'</div><div style="float:right;"><img src="'+internet+'" style="width:20px; height:20px;"><br><img src="'+mouse+'" style="padding-top:3px; width:20px; height:20px;"><br><img src="'+message+'" style="padding-top:0px; width:20px; height:20px;"></div><img class="thumb-image" src="'+photo+'"/><div id="userName">'+name+'</div></li>');

		$('#sortable').append('<li class="ui-state-default" id="sortable-'+i+'"><div id="pcName">'+pcname+'</div><img class="thumb-image" src="'+photo+'"/><div id="userName">'+name+'</div></li>');

	}
    selectList(selected);
	lastPClist = myclass.classroom.pclist;
}

var computerSelected="";

function showCapture(element,computer){
	
	computerSelected = computer;

    $("#imageBigBrother").html("<img src='"+$('#thumbCapture_'+element).attr("src")+"' id='imageCoputer-"+computer+"'/><br><br><input type='button' value='" + translations["ShowPC"] + "' onClick='javascript:connection(\"openVNC\",\"{\\\"args\\\":\\\""+computer+"\\\"}\"   ,\"\");'>");
	$("#imageBigBrother").show("slide",{},500);
}

function refreshCapture(url){
	$("#imageCoputer-"+computerSelected).attr("src",url);
}


function printBigBrother(equipos){

	if(equipos.images.length==0)
		return;

	$('#selectableBigBrother li').remove();

	for(var i=0;i<equipos.images.length;i++){

		var name = equipos.images[i].name;
		var photo = equipos.images[i].url;
		var pcname = equipos.images[i].pcname;

		if(photo=="no_screenshot")
			photo = "img/pcNone.png";					

		if(equipos.images[i].pcname=="Unknown"){
			pcname = "&nbsp;";
			name = "&nbsp;";
			photo = "img/pcNone.png";			
		}

		$('#selectableBigBrother').append('<li class="ui-state-default" id="selectable-'+i+'" onClick="showCapture(\''+i+'\',\''+pcname+'\');"><div id="pcName_'+i+'">'+pcname+'</div><img class="thumb-imageBigBrother" id="thumbCapture_'+i+'" src="'+photo+'"/><div id="userName_'+i+'">'+name+'</div></li>');
	}
}

function refreshBigBrother(equipos){

	if(equipos.images.length==0)
		return;

	for(var i=0;i<equipos.images.length;i++){

		var name = equipos.images[i].name;
		var photo = equipos.images[i].url;
		var pcname = equipos.images[i].pcname;

		if(photo=="no_screenshot")
			photo = "img/pcNone.png";		
		
		if(equipos.images[i].pcname=="Unknown"){
			pcname = "&nbsp;";
			name = "&nbsp;";
			photo = "img/pcNone.png";			
		}else{
			if(pcname!=$('#pcName_'+i).val())
				$('#pcName_'+i).val(pcname)

			if(name!=$('#userName_'+i).val())
				$('#userName_'+i).val(name)

			if(photo!=$('#thumbCapture_'+i).val())
				$('#thumbCapture_'+i).attr("src",photo);
		}

		if(computerSelected==pcname)
			refreshCapture(photo);
	}
}

function languageRequest(){
	connection("language","","translate");
}


function translate(data){
	$.each(data, function(key, value) { 
		$("#"+key).html(value);
	});
    translations=data
}
