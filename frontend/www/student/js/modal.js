/* #########################################################################
# Project:     Controlaula
# Module:     	modal.js
# Purpose:     Modal windows
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
