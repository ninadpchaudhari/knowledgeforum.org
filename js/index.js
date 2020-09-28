$(document).ready(function(){

  // enables the popover for refreshing servers on login tool tip
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
    $('[data-toggle="popover"]').popover()

    if($(window).width() <= 768) {
      document.getElementById("popover").setAttribute("data-trigger", "focus");
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

  document.getElementById("demo-image-container").addEventListener("click", function(){
    var iframe = document.getElementById("iframeDemo");
    iframe.setAttribute("src", "/html/demoview.html");
  });


});


// Executes all promises to get user token for each server at once
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
      promises.push(getUserTokenServerPair(uname, pwd, SERVERS[i].url));
    }
  } else {
    for(i in userStorage){
      promises.push(getUserTokenServerPair(uname, pwd, userStorage[i][0]));
    }
  }

  // execute all the login promises
  Promise.all(promises).then(function(data){
    responseHandler(uname, data);
  }).catch(function(error){
    console.log(error);
  });
}


// Handles each servers response to the users credentials
// If no succesful logins then displays error message to user
// Otherwise redirects to next page
// each item in data is [response body, server]
function responseHandler(uname, data){
  var successfulLogin = false;
  var errorMessage = "";
  var serverTokenPair = [];

  // retrieve users server information from local storage in order to find last active server
  // value will be null if its first login
  var userStorage = JSON.parse(localStorage.getItem(uname));

  for(i in data){
    if(data[i][0].token != undefined) {
      var token = data[i][0].token;
      var server = data[i][1];

      // if its the first login we set first server as the default active server
      // and all other servers as inactive
      if(userStorage == null && successfulLogin == false){
        serverTokenPair.push([server, token, "active"]);
      } else if(userStorage == null){
        serverTokenPair.push([server, token, "inactive"]);
      }

      // if it is not the first login then we retrieve last active server from localStorage
      // and set the rest to inactive
      else if(userStorage[i][2] == "active"){
        serverTokenPair.push([server, token, "active"]);
      } else {
        serverTokenPair.push([server, token, "inactive"]);
      }

      successfulLogin = true;

      // this else if case handles a user having the same username on multiple servers but with different passwords
    } else if(data[i][0].message != undefined && userStorage != null){
      var uname = document.getElementById("uname").value;
      var pwd = document.getElementById("pwd").value;
      localStorage.removeItem(uname);
      executePromises(uname, pwd);
      break;
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
