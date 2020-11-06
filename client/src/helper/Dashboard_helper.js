/*
* THIS FILE PROVIDES HELPER FUNCTIONS FOR LOGIN COMPONENT
*/
import $ from 'jquery';
import {getServerName} from '../config.js';
import {getServerURL} from '../config.js';
import {extractTokenFromStorage} from '../config.js';
import {getUserInfo} from '../api/user.js';
import {getUserCommunities} from '../api/user.js';
import {getCommunities} from '../api/community.js';
import {getCommunityWelcomeView} from '../api/community.js';
import {postCommunityRegistration} from '../api/community.js';

// adds the users servers to the side bar
export function appendUserServers(dashboard_component){
  var uname = localStorage.getItem("Username");
  var data = JSON.parse(localStorage.getItem(uname));
  var serverList = document.getElementById("server-list");
  var servers = [];

  dashboard_component.setState({username: uname});

  for(var i = 0; i < data.length; i++){
    var serverName = getServerName(data[i][0]);

    // set the last active server as the default
    if(data[i][2] == "active"){
      dashboard_component.setState({currentServerURL: data[i][0]});
      dashboard_component.setState({currentServerName: getServerName(data[i][0])});
      dashboard_component.setState({token: data[i][1]});
      servers.push({
        name: serverName,
        class: 'active',
        url: data[i][0]
      });
      loadServer(data[i][0], dashboard_component);
    } else {
      servers.push({
        name: serverName,
        class: '',
        url: data[i][0]
      });
    }
  }

  dashboard_component.setState({serverList: servers});
}


// replaces the "join community" and "my knowledge building communities" sections
// with the relevant information for the specified server
export function loadServer(server, dashboard_component){
  var token = extractTokenFromStorage(server);

  // LOAD USER COMMUNITY DATA AND UPDATE REACT STATE
  var userCommunitiesData = getUserCommunities(token, server);
  userCommunitiesData.then(function(result) {
    result.sort((a, b) => compareStrings(a._community.title, b._community.title));
    updateUserCommunities(result, server, dashboard_component);
  });

  // LOAD USER DATA AND UPDATE REACT STATE
  var userInfo = getUserInfo(token, server);
  userInfo.then(function(result) {
    if(result.error === true){
      tokenErrorHandler();
    } else {
      dashboard_component.setState({name: result.firstName + ' ' + result.lastName});
      dashboard_component.setState({userId: result._id});
    }

  });

  // LOAD SERVER COMMUNITY DATA AND UPDATE REACT STATE
  var serverCommunitiesData = getCommunities(token, server);
  serverCommunitiesData.then(function(result) {
    result.sort((a, b) => compareStrings(a.title, b.title));
    updateCommunities(result, dashboard_component);
  });

}

// updates the server community data react state
function updateCommunities(result, dashboard_component){
  var serverCommunityData = [];
  for(var i = 0; i < result.length; i++){
    var title = result[i].title;
    var communityId = result[i]._id;
    serverCommunityData.push({title: title, communityId: communityId});
  }

  dashboard_component.setState({serverCommunityData: serverCommunityData});
}


// updates the user community data react state
function updateUserCommunities(data, server, dashboard_component) {
  var token = extractTokenFromStorage(server);
  var promises = [];

  // for loop to create promises to get welcome view IDs for each community
  for(var i = 0; i < data.length; i++){
    var id = data[i].communityId;
    var p = getCommunityWelcomeView(token, id, server);
    promises.push(p);
  }

  // execute all promises and append the users communities
  Promise.all(promises).then(function(responses) {
    var userCommunityData = [];
    for(var i = 0; i < responses.length; i++){
      if(responses[i]){
        if(responses[i]._id){
          var title = data[i]._community.title;
          var id = data[i].communityId;
          var welcomeViewID = responses[i]._id;
          userCommunityData.push({
            title: title,
            server: dashboard_component.state.currentServerURL,
            token: dashboard_component.state.token,
            welcomeViewId: welcomeViewID,
          });
        }
      }
    }
    dashboard_component.setState({userCommunityData: userCommunityData});
  }).catch(function(error) {
    console.log(error);
  });
}


// registers the user for a community
export function joinCommunity(userId, server){
  var selectCommunityDropdown = document.getElementById("communityChoiceDropdown");
  var communityId = selectCommunityDropdown.options[selectCommunityDropdown.selectedIndex].value;
  var registrationKey = document.getElementById("communityKey").value;
  var token = extractTokenFromStorage(server);

  var promise = postCommunityRegistration(token, communityId, server, userId, registrationKey);
  promise.then(result => new Promise(resolve => {
    if(result[0].error === true){
      var errorMessageDiv = document.getElementById("errorMessage");
      errorMessageDiv.innerHTML = "Registration key does not match or you are already registered.";
      errorMessageDiv.style.display = "visible";
    }
    setTimeout(function(){
      resolve();
    }, 2000);
  })).then(() => {
    //location.reload();
  });
}


// function to handle an expired/invalid user token
// called if response status is 401 (might be errors other than invalid token)
function tokenErrorHandler(){
  alert("User authorization token expired");
  logout();
}


// clears local storage of the username and their user tokens and redircts to the login page
export function logout(dashboard_component){
  var uname = localStorage.getItem("Username");
  var userinfo = JSON.parse(localStorage.getItem(uname));

  if(uname == null || userinfo == null){
    localStorage.clear();
  } else {
    for(var i in userinfo){
      userinfo[i][1] = "";
    }
    localStorage.setItem(uname, JSON.stringify(userinfo));
    localStorage.removeItem("Username");
  }

  dashboard_component.props.history.push('/');
}


// function to add to buttons to toggle the side bar
export function toggleSidebar(){
  var div = document.getElementById('wrapper');
  if (div.className == "d-flex") {
    div.className = "d-flex toggled";
  } else {
    div.className = "d-flex";
  }
}


// function to return which string is higher alphabetically
// 1 if a is higher, -1 if b is higher, 0 if a == b
function compareStrings(a, b){
    if(a.toLowerCase() < b.toLowerCase()) { return -1; }
    if(a.toLowerCase() > b.toLowerCase()) { return 1; }
    return 0;
}
