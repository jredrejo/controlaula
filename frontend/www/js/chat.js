   function showIfError(response) {
       if (response.status == 'ok')
           return false;
       for (var err in response.errors) {
           $("#chat_div").chatbox("option", "boxManager").addMsg(response.status , response.errors[err]);
       };
       return true;
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

   		  
    function Configuration() {
        this.userName = '';
        this.channel = 'controlaula-chat';
        this.server = './';                   
    };

	function showChatbox(){
		$("#chat_div").chatbox("option", "hidden",false);
	}

	function hiddenChatbox(){
		$("#chat_div").chatbox("option", "hidden",true);
	}

	function initChat(){

       $.post("getLoginTeacher", { },
           function(data){
               if (data.login != "") {
                   conf.userName=data.login;        
                     
                   $("#chat_div").chatbox({
							  id : "chat_div",
	                    title : conf.userName|| "Chat ControlAula",
	                    user : conf.userName,
	                    offset: 20,
	                    hidden: true,
	                    messageSent: function(id, user, msg){                                       
	                         var data = conf.copyForRequest();
	                         data['message'] = msg
	                      $.post(conf.getChatURL(), data, cmdSubmitCallback, 'json');
	                }});           
                    
                    hiddenChatbox();
					}

     			}, "json");  

       Configuration.prototype.getChatURL = function() {
           return this.server + this.channel;
       };
       Configuration.prototype.copyForRequest = function() {
           return {user: this.userName};
       };

       conf = new Configuration();  
		 getChatMessage();  
	}
