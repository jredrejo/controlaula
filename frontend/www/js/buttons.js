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

		$("#internet")
			.button({ icons: { primary: "ui-icon-signal-diag"}})
			.click( function() {
				sendOrderSelected("enableInternet","","cambiaconfig");
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

	   $("#enableInternet").click(function() { sendOrderSelected("enableInternet","","cambiaconfig"); });
 	   $("#disableInternet").click(function() { sendOrderSelected("disableInternet","","cambiaconfig"); }); 

		$("#mouse")
			.button({ icons: { primary: "ui-icon-person"}})
			.click( function() {
				sendOrderSelected("enableMouse","","cambiaconfig");
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
				$(document).one("click", function() {
					menu.hide();
				});
				return false;
			})
		.parent()
			.buttonset()
		.next()
			.hide()
			.menu();

	   $("#enableMouse").click(function() { sendOrderSelected("enableMouse","","cambiaconfig"); });
 	   $("#disableMouse").click(function() { sendOrderSelected("disableMouse","","cambiaconfig"); }); 

		$("#sound")
			.button({ icons: { primary: "ui-icon-volume-on"}})
			.click( function() {
				sendOrderSelected("enableSound","","cambiaconfig");
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
				$(document).one("click", function() {
					menu.hide();
				});
				return false;
			})
		.parent()
			.buttonset()
		.next()
			.hide()
			.menu();

	   $("#enableSound").click(function() { sendOrderSelected("enableSound","","cambiaconfig"); });
 	   $("#disableSound").click(function() { sendOrderSelected("disableSound","","cambiaconfig"); }); 

		$("#messages")
			.button({ icons: { primary: "ui-icon-mail-closed"}})
			.click( function() {
				sendOrderSelected("enableMessages","","cambiaconfig");
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
				$(document).one("click", function() {
					menu.hide();
				});
				return false;
			})
		.parent()
			.buttonset()
		.next()
			.hide()
			.menu();

	   $("#enableMessages").click(function() { sendOrderSelected("enableMessages","","cambiaconfig"); });
 	   $("#disableMessages").click(function() { sendOrderSelected("disableMessages","","cambiaconfig"); }); 


		$("#projector")
			.button({ icons: { primary: "ui-icon-image"}})
			.click( function() {
				sendOrderSelected("enableProjector","","cambiaconfig");
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
				$(document).one("click", function() {
					menu.hide();
				});
				return false;
			})
		.parent()
			.buttonset()
		.next()
			.hide()
			.menu();

	   $("#enableProjector").click(function() { sendOrderSelected("enableProjector","","cambiaconfig"); });
 	   $("#disableProjector").click(function() { sendOrderSelected("disableProjector","","cambiaconfig"); }); 


		$("#video")
			.button({ icons: { primary: "ui-icon-video"}})
			.click( function() {
				sendOrderSelected("enableVideo","","cambiaconfig");
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
				$(document).one("click", function() {
					menu.hide();
				});
				return false;
			})
		.parent()
			.buttonset()
		.next()
			.hide()
			.menu();

	   $("#enableVideo").click(function() { sendOrderSelected("enableVideo","","cambiaconfig"); });
 	   $("#disableVideo").click(function() { sendOrderSelected("disableVideo","","cambiaconfig"); }); 

		$( "#sendMessage" ).button({ icons: { primary: "ui-icon-mail-closed"}});
		$( "#sendFile" ).button({ icons: { primary: "ui-icon-folder-open"}});

		$( "#web" ).button({ icons: { primary: "ui-icon-search"}});
		$( "#bigBrother" ).button({ icons: { primary: "ui-icon-person"}});

		$( "#connectLDAP" ).button({ icons: { primary: "ui-icon-refresh"}});
		$( "#scanNet" ).button({ icons: { primary: "ui-icon-refresh"}});

		$( "#saveConfiguration" )
			.button({ icons: { primary: "ui-icon-disk"}})
			.click(function(){ sendClassroomConfig(); });
});
