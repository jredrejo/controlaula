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
                $("#chataula_div").chatbox({id : "chataula_div",
                                        title : conf.userName|| "Chat ControlAula",
                                        user : conf.userName,
                                        offset: 20,
                                        messageSent: function(id, user, msg){                                       
                                             var data = conf.copyForRequest();
                                             data['message'] = msg
                                          $.post(conf.getChatClassURL(), data, cmdSubmitCallback, 'json');
                                        }});
                                        
                                        
                                        $("#chataula_div").chatbox("option", "hidden",false)
            });      

		$( "#chatTeacher" )
			.button({ icons: { primary: "ui-icon-mail-closed"}})
			.click(function(event, ui) {
                $("#chat_div").chatbox({id : "chat_div",
                                        title : conf.userName|| "Chat ControlAula",
                                        user : conf.userName,
                                        offset: 20,
                                        messageSent: function(id, user, msg){                                       
                                             var data = conf.copyForRequest();
                                             data['message'] = msg
                                          $.post(conf.getChatURL(), data, cmdSubmitCallback, 'json');
                                        }});
                                        
                                        
                                        $("#chat_div").chatbox("option", "hidden",false)
            });
});
