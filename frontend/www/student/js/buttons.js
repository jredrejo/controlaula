/* #########################################################################
# Project:     Controlaula
# Module:     	buttons.js
# Purpose:     Buttons of student page
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
