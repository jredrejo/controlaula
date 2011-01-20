/* #########################################################################
# Project:     Controlaula
# Module:     	buttons.js
# Purpose:     Buttons of main page
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

function printSplitButton(target,icon,funct){

		$("#"+target)
			.button({ icons: { primary: icon}})
			.click( function() {
				eval(funct);
			})
			.next()
				.button( {
					text: false,
					icons: {
						primary: "ui-icon-triangle-1-s"
					}
				})
				.click( function() {
					var menu = $(this).parent().next().show().position({
						my: "left top",
						at: "left bottom",
						of: this
					});
					$(document).one("click", function(i) {
						menu.hide();
					});
					return false;
				})
			.parent()
				.buttonset()
			.next()
				.hide()
				.menu();
}


$(function() {

		$( "#selectAll" )
			.button({ icons: { primary: "ui-icon-circle-plus"}})
			.click(function(){ selectAll() });

		$( "#selectNone" )
			.button({ icons: { primary: "ui-icon-circle-minus"}})
			.click(function(){ selectNone() });

		$( "#turnOn" )
			.button({ icons: { primary: "ui-icon-power"}})
			.click(function(){ sendOrderSelected("wakeup","","cambiaconfig"); });

		$( "#turnOff" )
			.button({ icons: { primary: "ui-icon-circle-close"}})
			.click(function(){ sendOrderSelected("sleep","","cambiaconfig"); });

		printSplitButton("internet","ui-icon-signal-diag",'sendOrderSelected("enableInternet","","cambiaconfig");');
	   $("#enableInternet").click(function() { sendOrderSelected("enableInternet","","cambiaconfig"); });
 	   $("#disableInternet").click(function() { sendOrderSelected("disableInternet","","cambiaconfig"); }); 

		printSplitButton("mouse","ui-icon-person",'sendOrderSelected("enableMouse","","cambiaconfig");');
	   $("#enableMouse").click(function() { sendOrderSelected("enableMouse","","cambiaconfig"); });
 	   $("#disableMouse").click(function() { sendOrderSelected("disableMouse","","cambiaconfig"); }); 

		printSplitButton("sound","ui-icon-volume-on",'sendOrderSelected("enableSound","","cambiaconfig");');
	   $("#enableSound").click(function() { sendOrderSelected("enableSound","","cambiaconfig"); });
 	   $("#disableSound").click(function() { sendOrderSelected("disableSound","","cambiaconfig"); }); 

		printSplitButton("messages","ui-icon-mail-closed",'sendOrderSelected("enableMessages","","cambiaconfig");');
	   $("#enableMessages").click(function() { sendOrderSelected("enableMessages","","cambiaconfig"); });
 	   $("#disableMessages").click(function() { sendOrderSelected("disableMessages","","cambiaconfig"); }); 

		printSplitButton("projector","ui-icon-image",'sendOrderSelected("enableProjector","","cambiaconfig");');
	   $("#enableProjector").click(function() { sendOrderSelected("enableProjector","","cambiaconfig"); });
 	   $("#disableProjector").click(function() { sendOrderSelected("disableProjector","","cambiaconfig"); }); 

		printSplitButton("video","ui-icon-video",'modalSendVideo();');
	   $("#enableVideo").click(function() { modalSendVideo(); });
	   $("#enableDVD").click(function() { sendOrderSelected("broadcastDVD","","broadcastDVD"); });

		$( "#sendMessage" )
			.button({ icons: { primary: "ui-icon-mail-closed"}})
			.click(function() { modalSendMessage() });

		printSplitButton("sendFile","ui-icon-folder-open",'modalSendFile();');
		$( "#receivedFiles" ).click(function() { modalReceivedFiles(); });

		$( "#web" )
			.button({ icons: { primary: "ui-icon-search"}})
			.click(function() { modalWeb(); });

		$( "#bigBrother" )
			.button({ icons: { primary: "ui-icon-person"}})
			.click(function() { modalBigBrother(); });

		printSplitButton("chat","ui-icon-video",' showChatbox() ');
	   $("#enableChat").click(function() { sendOrderSelected("enableChat","","cambiaconfig"); });
 	   $("#disableChat").click(function() { sendOrderSelected("disableChat","","cambiaconfig"); });
	   
		$( "#goToURL" )
			.button({ icons: { primary: "ui-icon-search"}})
			.click(function() { goToURL(""); }); 

		$( "#sendWebToSelected" )
			.button({ icons: { primary: "ui-icon-refresh"}})
			.click(function() { sendOrderSelected("launchweb", $("#frameWeb").attr("src"), "launchweb"); }); 

		$( "#sendWebToAll" )
			.button({ icons: { primary: "ui-icon-refresh"}})
			.click(function() { selectAll(); sendOrderSelected("launchweb", $("#frameWeb").attr("src"), "launchweb"); }); 

		$( "#connectLDAP" ).button({ icons: { primary: "ui-icon-refresh"}});
		$( "#scanNet" ).button({ icons: { primary: "ui-icon-refresh"}});

		$( "#saveConfiguration" )
			.button({ icons: { primary: "ui-icon-disk"}})
			.click(function(){ sendClassroomConfig(); });
});
