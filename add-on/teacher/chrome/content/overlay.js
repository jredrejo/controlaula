var ControlAula = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("ControlAula-strings");
    
    this.addToolbarButton();
    
  },


  onToolbarButtonCommand: function(e) {
    // just reuse the function above.  you can change this, obviously!
    ControlAula.onMenuItemCommand(e);
  },

   
   addToolbarButton : function() {
       
       
 try {
   var firefoxnav = document.getElementById("nav-bar");
   var curSet = firefoxnav.currentSet;

   if (curSet.indexOf("ControlAula-toolbar-button") == -1){
     var set;
     // Place the button before the urlbar
     if (curSet.indexOf("urlbar-container") != -1)
       set = curSet.replace(/urlbar-container/, "ControlAula-toolbar-button,urlbar-container");
     else  // at the end
       set = curSet + ",ControlAula-toolbar-button";
     firefoxnav.setAttribute("currentset", set);
     firefoxnav.currentSet = set;
     document.persist("nav-bar", "currentset");
	}
   if (curSet.indexOf("ControlAula-toolbar-button2") == -1){
     var set;
     // Place the button before the urlbar
     if (curSet.indexOf("urlbar-container") != -1)
       set = curSet.replace(/urlbar-container/, "ControlAula-toolbar-button2,urlbar-container");
     else  // at the end
       set = curSet + ",ControlAula-toolbar-button2";
     firefoxnav.setAttribute("currentset", set);
     firefoxnav.currentSet = set;
     document.persist("nav-bar", "currentset");
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

	if(!confirm("¿Desea realmente enviar la dirección web a los alumnos?"))
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
	xmlhttp.open("POST", "http://localhost:8900/launchwebToAll",true);
	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xmlhttp.send("url="+href+"&title="+doc.title);
}

function isMapsURL(url){
	return url.match("http://maps\\.google\\.[a-z]{2,3}(\\.[a-z]{2})?[/?].*") ||	url.match("http://www\\.google\\.[a-z]{2,3}(\\.[a-z]{2})?/maps.*");
}
