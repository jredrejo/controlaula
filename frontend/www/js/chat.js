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
