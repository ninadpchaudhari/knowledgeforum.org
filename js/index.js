$(document).ready(function(){

  $('#loginForm').on("submit", function(e){
    e.preventDefault();
    var uname = document.getElementById("uname").value;
    var pwd = document.getElementById("pwd").value;
    document.getElementById("errorMessage").innerHTML = "";
    document.getElementById("errorMessage").style.display = "hidden";
    executePromises(uname, pwd);
    return false;
  })

});


// Creates an individual login promise for each server
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


// Executes all promises at once using promise.all()
function executePromises(uname, pwd){
  const promises = [];

  for(i in SERVERS){
    promises.push(createLoginPromiseForURL(uname, pwd, SERVERS[i].url));
  }

  Promise.all(promises).then(function(responses) {
    return Promise.all(responses.map(function (response) {
      return response;
    }));
  }).then(function(data) {
    responseHandler(data);
  }).catch(function(error) {
    console.log(error);
  });
}


// Handles each servers response to the users credentials
function responseHandler(data){
  var successfulLogin = false;
  var errorMessage = "";

  for(i in data){
    if(data[i][0].token != undefined){
      successfulLogin = true;
      localStorage.setItem(data[i][1], data[i][0].token);
    } else if(errorMessage == "") {
      errorMessage = data[i][0].message;
    } else if(errorMessage == "This userName is not registered." && data[i][0].message == "This password is not correct."){
      errorMessage = data[i][0].message;
    }
  }

  if(!successfulLogin){
    var errorMessageDiv = document.getElementById("errorMessage");
    errorMessageDiv.innerHTML = errorMessage;
    errorMessageDiv.style.display = "visible";
  }

  console.log(localStorage);
}
