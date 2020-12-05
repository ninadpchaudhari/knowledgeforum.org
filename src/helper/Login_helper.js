/*
* THIS FILE PROVIDES HELPER FUNCTIONS FOR LOGIN COMPONENT
*/
import {getUserTokenServerPair} from '../api/user.js';
import {SERVERS} from '../config.js';


// Executes all promises to get user token for each server at once
export function executePromises(uname, pwd, login_form_component){
  const promises = [];

  // if the checkbox on login page is checked clear the local storage
  var firstLogin = document.getElementById("refreshCheckbox").checked;
  if(firstLogin){ localStorage.clear(); }

  var userStorage = JSON.parse(localStorage.getItem(uname));

  // If it is the first time logging in we test all servers (userStorage == null)
  // else we only call the servers stored in users local storage list
  if(userStorage == null){
    for(let i in SERVERS){
      promises.push(getUserTokenServerPair(uname, pwd, SERVERS[i].url));
    }
  } else {
    for(let i in userStorage){
      promises.push(getUserTokenServerPair(uname, pwd, userStorage[i][0]));
    }
  }

  // execute all the login promises
  return Promise.all(promises).then(function(data){
    return responseHandler(uname, data, login_form_component);
  }).catch(function(error){
    console.log(error);
  });
}


// Handles each servers response to the users credentials
// If no succesful logins then displays error message to user
// Otherwise redirects to next page
// each item in data is [response body, server]
export function responseHandler(uname, data, login_form_component){
  var successfulLogin = false;
  var errorMessage = "";
  var serverTokenPair = [];

  // retrieve users server information from local storage in order to find last active server
  // value will be null if its first login
  var userStorage = JSON.parse(localStorage.getItem(uname));

  for(var i in data){
    if(data[i][0].token !== undefined) {
      var token = data[i][0].token;
      var server = data[i][1];

      if((userStorage === null && successfulLogin === false) || (userStorage !== null && userStorage[i][2] === "active")){
        serverTokenPair.push([server, token, "active"]);
      } else {
        serverTokenPair.push([server, token, "inactive"]);
      }

      successfulLogin = true;

      // this else if case handles a user having the same username on multiple servers but with different passwords
    } else if(data[i][0].message !== undefined && userStorage !== null){
      var username = document.getElementById("uname").value;
      var password = document.getElementById("pwd").value;
      localStorage.removeItem(username);
      return executePromises(username, password, login_form_component);
    } else if(data[i][0].message !== undefined && errorMessage === "") {
      errorMessage = data[i][0].message;
    } else if(errorMessage === "This userName is not registered." && data[i][0].message === "This password is not correct.") {
      errorMessage = data[i][0].message;
    } else if(data[i][0].error !== undefined && errorMessage === "") {
      errorMessage = data[i][0].error;
    }
  }

  if(!successfulLogin){
    document.getElementById("errorMessage").style.display = "visible";
    login_form_component.setState({errorMessage: errorMessage});
    return 0;
  } else {
    localStorage.setItem("Username", uname);
    localStorage.setItem(uname, JSON.stringify(serverTokenPair));
    return 1;
  }
}

export function getLoginData(){
    const uname = localStorage.getItem("Username");
    if (uname){
        const servers = JSON.parse(localStorage.getItem(uname));
        for(let server_data of servers){
            if (server_data[2] === 'active' && server_data[1] !== ""){
                return server_data;
            }
        }
    }
    return [null,null,null]
}
