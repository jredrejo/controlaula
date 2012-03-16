//http://code.google.com/chrome/extensions/getstarted.html
//https://chrome.google.com/webstore/search/locallinks?hl=es

console.log("Loaded.")

function errorHandler(e) {
  console.log("err:", e);
  
  var msg = '';


  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };


  console.log('Error: ' + msg);  
}


function abrepagina() {
//newwindow = window.open(url, "_blank", "resizable=yes, scrollbars=yes, titlebar=yes, width=800, height=900, top=10, left=10");

//chrome.extension.getURL(..

	var nuevaurl= "file:///home/jose/.controlaula/controlaula.html"
    var nuevaurl= "http://localhost:8900/index.html"
    newwindow = window.open(nuevaurl)
    
  
    
    
    
    
    /*
	xmlhttp = new XMLHttpRequest(); 

	 
	xmlhttp.open("GET",  nuevaurl,true);
	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xmlhttp.send('data={"args":"'+href + '"}');*/
    //window.requestFileSystem(window.TEMPORARY, 1024*1024, onInitFs, errorHandler);
    //window.webkitRequestFileSystem(window.TEMPORARY, 1024*1024, onInitFs, errorHandler); //1 MB
    
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;


    
   //window.requestFileSystem(window.PERSISTENT, 5*1024*1024 /*5MB*/, onInitFs, errorHandler);
    //window.requestFileSystem(window.TEMPORARY, 5*1024*1024 /*5MB*/, onInitFs, errorHandler);
    
 // window.webkitRequestFileSystem(window.TEMPORARY, 80*1024*1024, createhd, errorHandler);

  
  var url = chrome.extension.getURL('sprites.png');
console.log(url);  
  
  
  
}
function createhd(fs) {
  hd=fs.root;
  path='kkkkk';
  show();
}    

function show(){

  hd.getDirectory(path,{create: true, exclusive: false},readdir,errorHandler);
}


function readdir(dir){
  var reader=dir.createReader();
  var read=function(){
      reader.readEntries(function(files){
          if(files.length){
            list(files);
            read();
          }
        }, errorHandler);
    }
  read();    
}



function onInitFs(fs) {


fs.root.getDirectory('kkkkk', {create: true, exclusive: false},
                        dirCallback, errorHandler);
var dirCallback = function(dirEntry){
       console.log(dirEntry.name);
};

//flags : {create: true|false, exclusive: true|false}


/*
  fs.root.getFile('/home/jose/log.txt', {}, function(fileEntry) {

    // Get a File object representing the file,
    // then use FileReader to read its contents.
    fileEntry.file(function(file) {
       var reader = new FileReader();

reader.onload = function() {
    var text = reader.result;
    console.log("texto leido:", text);
  }
  reader.onerror = function(e) { console.log(e); }

       reader.onloadend = function(e) {
         var txtArea = document.createElement('textarea');
         txtArea.value = this.result;
         document.body.appendChild(txtArea);
         console.log("texto leido:", this.result);
       };

       reader.readAsText(file);
    }, errorHandler);

  }, errorHandler);
  
  */

}


function updateIcon() {
  chrome.browserAction.setIcon({path:"icon" + current + ".png"});
  current++;

  if (current > max)
    current = min;
}




function openLinkInCurrentTab(url)
{
  chrome.tabs.getSelected(null, function(selected_tab) {
    chrome.tabs.update(selected_tab.id, {url: url});
  });
}

function openLinkInNewForegroundTab(url)
{
  chrome.tabs.getSelected(null, function(selected_tab) {
    chrome.tabs.create(
      _propertiesForNewTab(url, selected_tab, {selected: true})
    );
  });
}

function openLinkInNewBackgroundTab(url)
{
  chrome.tabs.getSelected(null, function(selected_tab) {
    chrome.tabs.create(
      _propertiesForNewTab(url, selected_tab, {selected: false})
    );
  });
}

function _propertiesForNewTab(
  url,
  base_tab,
  overriding_properties // optional
)
{
  if (typeof overriding_properties === 'undefined')
  {
    overriding_properties = {};
  }

  // I want to emulate native Chrome behavior.
  // So I will open new tab adjacent to base.
  return $.extend(true, // deep copy
  {
    windowId: base_tab.windowId,
    index:    base_tab.index + 1,
    url:      url,
  }, overriding_properties);
}


//chrome.browserAction.onClicked.addListener(updateIcon);
//updateIcon();

chrome.browserAction.onClicked.addListener(abrepagina);
