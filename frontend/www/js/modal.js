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
    var noButton = translations["No"];
    var yesButton = translations["Yes"];
    var dlgButtons = {};
    dlgButtons[noButton]=function() { $( this ).dialog( "close" ); };
    dlgButtons[yesButton]=function() { eval(funct); };
    
	$("#dialogAlert")
		.dialog({
			modal: true,
			width: 350,
			resizable: false,
			buttons: dlgButtons
		})
		.dialog('open'); 

	return true;
}

function modalSendFile(){
	var selected = computersSelected();

	if(selected.length==0){
		modalAlert(translations["OnePCAtLeast"]);
		return;
	}
    var clsButton = translations["Close"];
    var dlgButtons = {};
    dlgButtons[clsButton]=function() { $( this ).dialog( "close" ); };
    
	$("#dialogSendFile")
		.dialog({
			title: translations["sendFile"],
			modal: true,
			width: 550,
			resizable: false,
			buttons: dlgButtons
			
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
				modalConfirm(translations["confirmFile" ],"sendOrderSelected('sendFile','"+file+"','sendFile');");
		});

	return true;
}

function modalReceivedFiles(){

    var opnButton = translations["OpenReceivedFolder"];
    var clsButton = translations["Close"];
    var dlgButtons = {};
    dlgButtons[ opnButton ] = function() { sendOrder('openFile','dirReceivedTeacher','openFile'); };
    dlgButtons[clsButton]=function() { $( this ).dialog( "close" ); };

	$("#dialogSendFile")
		.dialog({
			title: translations["ReceivedFiles"],
			modal: true,
			width: 550,
			resizable: false,
			buttons: dlgButtons
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
		modalAlert(translations["mustSelectOneSend"]);
		return;
	}

	$("#message").val("");
    
    var sndButton = translations["Send"];
    var clsButton = translations["Close"];
    var dlgButtons = {};
    dlgButtons[ sndButton ] = function() { 
					if($("#message").val()=="")
						modalAlert(translations["mustTypeMessage"]);
					else
						sendOrderSelected("sendMessage",$("#message").val(),"sendMessage");
				};
    dlgButtons[clsButton]=function() { $( this ).dialog( "close" ); };

	$("#dialogSendMessage")
		.dialog({
			title: translations["SendMessage"],
			modal: true,
			width: 550,
			resizable: false,
			buttons: dlgButtons
		})
		.dialog('open'); 

	return true;
}

function modalSendVideo(dir){

	if(dir==null)
		dir="home";

	var selected = computersSelected();

	if(selected.length==0){
		modalAlert(translations["mustSelectOneVideo"]);
		return;
	}

    
    var clsButton = translations["Close"];
    var dlgButtons = {};

    dlgButtons[clsButton]=function() { $( this ).dialog( "close" ); };



	$("#dialogSendFile")
		.dialog({
			title: translations["enableVideo"],
			modal: true,
			width: 550,
			resizable: false,
			buttons: dlgButtons
		})
		.dialog('open'); 

	$('#sendFileTree').fileTree({
		root: dir, 
		script: 'getVideoNodes',
		folderEvent: 'click', 
		expandSpeed: 750, 
		collapseSpeed: 750, 
		multiFolder: false },
		function(file) { 
			modalConfirm(translations["ConfirmVideo"],"sendOrderSelected('broadcast','"+file+"','broadcast');");
	});

	return true;
}

function modalVideoButtons(){
    var clsButton = translations["Close"];
    var dlgButtons = {};

    dlgButtons[clsButton]=function() { $( this ).dialog( "close" ); };
    
	$("#dialogVideoButtons")
		.dialog({
			title: translations["videoButtons"],
			modal: true,
			width: 450,
			resizable: false,
			buttons: dlgButtons,
			beforeClose: function(event, ui) { connection("movie_close","","movie_close"); }
		})
		.dialog('open'); 

	return true;
}

function goToURL(url){

	if(url=="")	
		url=$("#url").val();

	$("#frameWeb").attr("src","http://"+url);
	$("#url").val(url);
}

function modalWeb(){

	goToURL("www.google.es");

	$("#dialogWeb")
		.dialog({
			title: translations["WebBrowsing"],
			modal: true,
			width: 950,
			resizable: false
		})
		.dialog('open'); 
	return true;
}

function modalBigBrother(){
    var clsButton = translations["Close"];
    var dlgButtons = {};

    dlgButtons[clsButton]=function() { $( this ).dialog( "close" ); };
    
	$("#dialogBigBrother")
		.dialog({
			title: translations["bigBrother"],
			modal: true,
			width: 950,
			resizable: false,
			buttons: dlgButtons,
			beforeClose: function(event, ui) { connection("disableBigBrother","","disableBigBrother"); }
		})
		.dialog('open'); 

	connection("bigbrother","","bigbrother");

	return true;
}
