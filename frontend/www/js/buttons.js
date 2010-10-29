
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
			.click(function() { modalWeb() });

		$( "#bigBrother" )
			.button({ icons: { primary: "ui-icon-person"}})
			.click(function() { modalBigBrother() });

		printSplitButton("chat","ui-icon-video",' showChatbox() ');
	   $("#enableChat").click(function() {  showChatbox(); });
 	   $("#disableChat").click(function() { hiddenChatbox(); }); 

		$( "#goToURL" )
			.button({ icons: { primary: "ui-icon-search"}})
			.click(function() { goToURL(""); }); 

		$( "#connectLDAP" ).button({ icons: { primary: "ui-icon-refresh"}});
		$( "#scanNet" ).button({ icons: { primary: "ui-icon-refresh"}});

		$( "#saveConfiguration" )
			.button({ icons: { primary: "ui-icon-disk"}})
			.click(function(){ sendClassroomConfig(); });
});
