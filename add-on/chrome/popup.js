function sendLink() {
     
  chrome.windows.getCurrent(function(w) {     
      chrome.tabs.getSelected(w.id,function (response){      
      
        href = response.url;
        if (response.url.indexOf("http:") == 0 ||
            response.url.indexOf("https:") == 0) {
                    var req = new XMLHttpRequest(); 
                    var nuevaurl = "http://localhost:" +  localStorage.port  + "/launchwebToAll";
                    req.open("POST", nuevaurl, true);
                    var params = 'data={"args":"'+href + '"}'
                    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    req.setRequestHeader("Content-length", params.length);
                    req.setRequestHeader("Connection", "close");
                    req.send(params);                
            }       
      });
  });

}    


function openPage() {
    var nuevaurl= "http://localhost:" + localStorage.port + "/controlaula/" + localStorage.uid 
    newwindow = window.open(nuevaurl);
}


function main(){
    document.getElementById("btn1").innerHTML="<img src='controlaula-button.png'>" + chrome.i18n.getMessage("see_classroom");
    document.getElementById("btn2").innerHTML="<img src='controlaula-button2.png'>" + chrome.i18n.getMessage("launch_web");         
}
