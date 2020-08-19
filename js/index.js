$(document).ready(function(){

  // enables the popover for refreshing servers on login tool tip
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
    $('[data-toggle="popover"]').popover()

    if($(window).width <= 768) {
      document.getElementById("popover").setAttribute("data-trigger", "click");
    }
  })

  $('#loginForm').on("submit", function(e){
    e.preventDefault();
    var uname = document.getElementById("uname").value;
    var pwd = document.getElementById("pwd").value;
    document.getElementById("errorMessage").innerHTML = "";
    document.getElementById("errorMessage").style.display = "hidden";
    executePromises(uname, pwd);
    return false;
  })

  getiFrameSrc();

});

// function to get the demo users token and create the url for the iframe and set it
// username, password, server, and welcomeviewid are from config.js
function getiFrameSrc(){

  var promise = createLoginPromiseForURL(USERNAME, PASSWORD, SERVER);
  promise.then(function(result){
    var token = result[0].token;
    var url = SERVER + "auth/jwt?token=" + token + "&redirectUrl=/view/" + WELCOMEVIEWID;
    var iframe = document.getElementById("iframeDemo");
    iframe.setAttribute("src", url);
  })

}


// Creates a login promise for a server
function createLoginPromiseForURL(uname, pwd, url){
  var body = {
    'userName': uname,
    'password': pwd
  };

  return fetch(url + 'auth/local', {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  }).then(function(response) {
      return response.json();
  }).then(function(body) {
      return ("Success:", [body, url]);
  }).catch(function(error) {
      return ("Error:", error);
  });
}


// Executes all promises for the servers at once
function executePromises(uname, pwd){
  const promises = [];

  // if the checkbox on login page is checked clear the local storage
  var firstLogin = document.getElementById("refreshCheckbox").checked;
  if(firstLogin){ localStorage.clear(); }

  var userStorage = JSON.parse(localStorage.getItem(uname));

  // If it is the first time logging in we test all servers (userStorage == null)
  // else we only call the servers stored in users local storage list
  if(userStorage == null){
    for(i in SERVERS){
      promises.push(createLoginPromiseForURL(uname, pwd, SERVERS[i].url));
    }
  } else {
    for(i in userStorage){
      promises.push(createLoginPromiseForURL(uname, pwd, userStorage[i][0]));
    }
  }

  // execute all promises
  Promise.all(promises).then(function(responses) {
    return Promise.all(responses.map(function (response) {
      return response;
    }));
  }).then(function(data) {
    responseHandler(uname, data);
  }).catch(function(error) {
    console.log(error);
  });
}


// Handles each servers response to the users credentials
// If no succesful logins then displays error message to user
// Otherwise redirects to next page
function responseHandler(uname, data){
  var successfulLogin = false;
  var errorMessage = "";
  var serverTokenPair = [];

  // retrieve users server information from local storage in order to find last active server
  // value will be null if its first login
  var userStorage = JSON.parse(localStorage.getItem(uname));

  for(i in data){
    if(data[i][0].token != undefined) {
      successfulLogin = true;
      var url = data[i][1];
      var token = data[i][0].token;

      // if its the first login we set first server as the default active server
      // and all other servers as inactive
      if(userStorage == null && i == 0){
        serverTokenPair.push([url, token, "active"]);
      } else if(userStorage == null && i != 0){
        serverTokenPair.push([url, token, "inactive"]);
      }

      // if it is not the first login then we retrieve last active server from localStorage
      // and set the rest to inactive
      else if(userStorage[i][2] == "active"){
        serverTokenPair.push([url, token, "active"]);
      } else {
        serverTokenPair.push([url, token, "inactive"]);
      }

    } else if(errorMessage == "") {
      errorMessage = data[i][0].message;
    } else if(errorMessage == "This userName is not registered." && data[i][0].message == "This password is not correct.") {
      errorMessage = data[i][0].message;
    }
  }

  if(!successfulLogin){
    var errorMessageDiv = document.getElementById("errorMessage");
    errorMessageDiv.innerHTML = errorMessage;
    errorMessageDiv.style.display = "visible";
  } else {
    localStorage.setItem("Username", uname);
    localStorage.setItem(uname, JSON.stringify(serverTokenPair));
    window.location.href = "html/dashboard.html";
  }

}
