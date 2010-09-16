ControlAula.onFirefoxLoad = function(event) {
  document.getElementById("contentAreaContextMenu")
          .addEventListener("popupshowing", function (e){ ControlAula.showFirefoxContextMenu(e); }, false);
          
          
          
  ControlAula.addToolbarButton();        
          
};

ControlAula.showFirefoxContextMenu = function(event) {
  // show or hide the menuitem based on what the context menu is on
  document.getElementById("context-ControlAula").hidden = gContextMenu.onImage;
};

window.addEventListener("load", ControlAula.onFirefoxLoad, false);


