   function showIfError(response) {
    
           return false;
   };

   function cmdSubmitCallback(response) {
       showIfError(response);
   };

   function getChatMessageCallback(response) {
       showIfError(response);
       
       $("#chat_div").chatbox("option", "boxManager").addMsg(response.user, response.message);
       getChatMessage();
   };

   function getChatMessage(data) {
       var data = data || {};
       $.get(conf.getChatURL(), data, getChatMessageCallback, 'json');
   };


	function showChatbox(){
		$("#chat_div").chatbox("option", "hidden",false);
	}

	function hiddenChatbox(){
		$("#chat_div").chatbox("option", "hidden",true);
	}

	function initChat(){
                            
       $("#chat_div").chatbox({
                  id : "chat_div",
            title : conf.userName|| "Chat ControlAula",
            user : conf.userName,
            offset: 20,
            width: 400,
            hidden: true,
            messageSent: function(id, user, msg){                                       
                 var data = conf.copyForRequest();
                 data['message'] = msg;
              $.post(conf.getChatURL(), data, cmdSubmitCallback, 'json');
        }});           
        
        hiddenChatbox();

       getChatMessage();  
	}
