var ControlAula = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("ControlAula-strings");

  },


  onToolbarButtonCommand: function(e) {
    // just reuse the function above.  you can change this, obviously!
    ControlAula.onMenuItemCommand(e);
  },

   
   addToolbarButton : function() {
       
       
 try {
   var firefoxnav = document.getElementById("nav-bar");
   var curSet = firefoxnav.currentSet;
   var index1=curSet.indexOf("ControlAula-toolbar-button")
   var index2=curSet.indexOf("ControlAula-toolbar-button2")


   if (index1 == -1 || index1==index2 ||index2 ==-1 && prefs.getBoolPref("isTeacher")==true ){
     var set;
     // Place the button before the urlbar
     if (curSet.indexOf("urlbar-container") != -1)
       if (prefs.getBoolPref("isTeacher")==true)
       		set = curSet.replace(/urlbar-container/, "ControlAula-toolbar-button,ControlAula-toolbar-button2,urlbar-container");
       else
       		set = curSet.replace(/urlbar-container/, "ControlAula-toolbar-button,urlbar-container");
     else  // at the end
     	if (prefs.getBoolPref("isTeacher")==true)
     		set = curSet + ",ControlAula-toolbar-button,ControlAula-toolbar-button2";
     	else
       		set = curSet + ",ControlAula-toolbar-button";
     firefoxnav.setAttribute("currentset", set);
     firefoxnav.currentSet = set;
     document.persist("nav-bar", "currentset");
     
	}
	
    if (prefs.getBoolPref("isTeacher")!=true) {   
        if (curSet.indexOf("ControlAula-toolbar-button2") != -1)   		   		
        {
            var buttonnav = document.getElementById("ControlAula-toolbar-button2");			
            buttonnav.hidden=true;
        }
     }

   // If you don't do the following call, funny things happen
   try {
     BrowserToolboxCustomizeDone(true);
   }
   catch (e) { }

 }
 catch(e) { }
 
        
   }
};

window.addEventListener("load", ControlAula.onLoad, false);


function sendLink() {

	if(!confirm(this.strings.getString("confirmWeb")))
		return false;

	var doc = gBrowser.contentDocument,
		href = doc.location.href;

	// Is it the Google Maps page?
	if (isMapsURL(href)){
		// Then try to send the current view:
		var link = doc.getElementById('link');
		if (link && link.href)
			href = link.href;
	}

	var focusedWindow = document.commandDispatcher.focusedWindow;
	var selection = focusedWindow.getSelection().toString();

	// send link with Ajax
	xmlhttp = new XMLHttpRequest(); 
	var nuevaurl= prefs.getCharPref("url") + ":" +  prefs.getCharPref("port") + "/launchwebToAll"
	 Components.utils.reportError(nuevaurl);
	xmlhttp.open("POST",  nuevaurl,true);
	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xmlhttp.send('data={"args":"'+href + '"}');
}

function isMapsURL(url){
	return url.match("http://maps\\.google\\.[a-z]{2,3}(\\.[a-z]{2})?[/?].*") ||	url.match("http://www\\.google\\.[a-z]{2,3}(\\.[a-z]{2})?/maps.*");
}
