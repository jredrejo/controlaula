   function cmdSubmitCallback(response) {
       return false;
   };

   function getChatMessageCallback(response) {
       $("#chataula_div").chatbox("option", "boxManager").addMsg(response.user, response.message);
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
		$("#chataula_div").chatbox("option", "hidden",false);
	}

	function hiddenChatbox(){
		$("#chataula_div").chatbox("option", "hidden",true);
	}

	function initChat(){

       $.post("getLoginTeacher", { },
           function(data){
               if (data.login != "") {
                   conf.userName=data.login;        
                     
                   $("#chataula_div").chatbox({
							  id : "chataula_div",
	                    title : conf.userName|| "Chat ControlAula",
	                    user : conf.userName,
	                    //offset: 20,
                        width: 490,
	                    hidden: true,
	                    messageSent: function(id, user, msg){                                       
	                         var data = conf.copyForRequest();
	                         data['message'] = msg
	                      $.post(conf.getChatURL(), data, cmdSubmitCallback, 'json');
	                }});                               
                    
                    $("#chataula_div").chatbox("option", "append",$('#tabsClassroom-4'));
                    
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
