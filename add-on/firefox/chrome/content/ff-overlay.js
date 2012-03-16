ControlAula.onFirefoxLoad = function(event) {
  document.getElementById("contentAreaContextMenu")
          .addEventListener("popupshowing", function (e){ ControlAula.showFirefoxContextMenu(e); }, false);
          
          
          
  ControlAula.addToolbarButton();        
          
};

ControlAula.showFirefoxContextMenu = function(event) {
  // show or hide the menuitem based on what the context menu is on
  document.getElementById("context-ControlAula").hidden = gContextMenu.onImage;
};

                      
var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefService);
prefs = prefs.getBranch("extensions.ControlAula.")
var dirService = Components.classes["@mozilla.org/file/directory_service;1"].
                  getService(Components.interfaces.nsIProperties); 
var homeDirFile = dirService.get("Home", Components.interfaces.nsIFile); 
var homeDir = homeDirFile.path;                      
window.addEventListener("load", ControlAula.onFirefoxLoad, false);


// Parse our json file:
var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
file.initWithPath(homeDir + "/.controlaula/data.json");
data = "";
resultado=null;            

if (file.exists()) {
    data = "";
    fstream = Cc["@mozilla.org/network/file-input-stream;1"]
                     .createInstance(Ci.nsIFileInputStream);
    sstream = Cc["@mozilla.org/scriptableinputstream;1"]
                     .createInstance(Ci.nsIScriptableInputStream);
    fstream.init(file, -1, 0, 0);
    sstream.init(fstream);

    while (sstream.available())
      data += sstream.read(4096);

    sstream.close();
    fstream.close();
    JSON = Cc["@mozilla.org/dom/json;1"].createInstance(Ci.nsIJSON);
    resultado= JSON.decode(data);

    //save preferences
    prefs.setCharPref("port",resultado["port"]);
    prefs.setCharPref("url",resultado["url"]);
    prefs.setBoolPref("isTeacher", eval(resultado["isTeacher"]));
    
    var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                                   .getService(Components.interfaces.nsIPrefService);
    prefService.savePrefFile(null);
    
 
}
