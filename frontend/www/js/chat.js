/* #########################################################################
# Project:     Controlaula
# Module:     	chat.js
# Purpose:     Chat functions
# Language:    javascript
# Copyright:   2009-2010 - Jose Luis Redrejo <jredrejo @nospam@ debian.org>
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

   function cmdSubmitCallback(response) {
       return false;
   };

   function getChatMessageCallback(response) {
       
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
