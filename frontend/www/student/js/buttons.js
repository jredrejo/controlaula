$(function() {

		$( "#sendFileStudent" )
			.button({ icons: { primary: "ui-icon-folder-open"}})
			.click(function() { modalSendFile() });

		$( "#receivedFileStudent" )
			.button({ icons: { primary: "ui-icon-folder-open"}})
			.click(function() { modalReceivedFiles() });

		$( "#chatClassroom" )
			.button({ icons: { primary: "ui-icon-mail-closed"}})
			.click(function(event, ui) {                                                                                
                $("#chat_div").chatbox("option", "hidden",false)
            });      


});
