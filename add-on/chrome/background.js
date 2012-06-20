function errorHandler(e) {
  console.log("err:", e);
}

function requestUserData(tab)
{
    port = 8900;
    askInfo(onData);
}

function onData(data) {
    if (data == null) 
    {
        if (port <= 8910) {
            port++;
            askInfo(onData);
        } else {
            if (localStorage.port != undefined ) 
                openPage(); 
            port = 8900;
        }
        
     } else {   
        localStorage.homeDir = data["home"];
        localStorage.login = data["login"];
        localStorage.teacher = data["teacher"];
        localStorage.port = port;
        if (localStorage.teacher == "true")
        {//crear barra de launchall
        chrome.browserAction.setPopup({popup:"popup.html"});
        }
        openPage();
    }
}


function askInfo(callback)
{
    var req = new XMLHttpRequest();
    req.open("POST", "http://localhost:" + port.toString() + "/BROWSER", true);
    var params = "title=test" ;
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.setRequestHeader("Content-length", params.length);
    req.setRequestHeader("Connection", "close");
    req.send(params);

    req.onreadystatechange = function() 
    { 
        if (req.readyState == 4)
          if (req.status == 200) {
              try {
                    var data = JSON.parse(req.responseText);
                    callback(data);
                }
            catch(err) {
                callback(null);
            }
          } else {
            callback(null);
          }        
    };
    return false;
}


chrome.browserAction.onClicked.addListener(requestUserData);
