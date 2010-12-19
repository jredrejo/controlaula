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
   if (curSet.indexOf("ControlAula-toolbar-button") == -1)
   {
     var set;
     // Place the button before the urlbar
     if (curSet.indexOf("urlbar-container") != -1)
       set = curSet.replace(/urlbar-container/, "ControlAula-toolbar-button,urlbar-container");
     else  // at the end
       set = curSet + ",ControlAula-toolbar-button";
     firefoxnav.setAttribute("currentset", set);
     firefoxnav.currentSet = set;
     document.persist("nav-bar", "currentset");
     // If you don't do the following call, funny things happen
     try {
       BrowserToolboxCustomizeDone(true);
     }
     catch (e) { }
   }
 }
 catch(e) { }
 
        
   }
};

window.addEventListener("load", ControlAula.onLoad, false);
