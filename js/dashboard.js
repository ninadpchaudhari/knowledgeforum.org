$(document).ready(function() {

  // loads the users servers and append all information to the page
  appendUserServers();

});

// adds the users servers to the side bar
function appendUserServers(){
  var uname = localStorage.getItem("Username");
  var data = JSON.parse(localStorage.getItem(uname));
  var serverList = document.getElementById("server-list");

  for(var i = 0; i < data.length; i++){
    var serverName = getServerName(data[i][0]);

    // set the last active server as the default
    if(data[i][2] == "active"){
      $("#server-list").append("<li onclick='loadServer(\"" + data[i][0] + "\")' class = 'active'>" + serverName + "</li>");
      loadServer(data[i][0]);
    } else {
      $("#server-list").append("<li onclick='loadServer(\"" + data[i][0] + "\")' class = ''>" + serverName + "</li>");
    }
  }

  // event to juggle active tag to most recently clicked server
  $('#server-list').on('click','li', function(){

    // handles active tag in html
   $(this).addClass('active').siblings().removeClass('active');

   // handles the active tag in local storage
   var activeServerURL = getServerURL(this.innerText);
   var serverTokenPair = [];
   for(i in data){
     var server = data[i][0];
     var token = data[i][1];
     var status = (server == activeServerURL) ? "active" : "inactive";
     serverTokenPair.push([server, token, status]);
   }

   var uname = localStorage.getItem("Username");
   localStorage.setItem(uname, JSON.stringify(serverTokenPair));
  });

}


// replaces the "join community" and "my knowledge building communities" sections
// with the relevant information for the specified server
function loadServer(server){
  var token = extractTokenFromStorage(server);

  // reset loading gif for user communities
  $('#userCommunities').replaceWith('<ul class="userCommunities" id = "userCommunities"><div class = "loader"></div></ul>');
  var userCommunitiesData = getUserCommunities(token, server);
  userCommunitiesData.then(function(result) {
    appendUserCommunities(result, server);
  });

  var userInfo = getUserInfo(token, server);
  userInfo.then(function(result) {
    if(result.error === true){
      tokenErrorHandler();
    } else {
      var firstName = result.firstName;
      var lastName = result.lastName;
      var userId = result._id;
      var serverName = getServerName(server);
      $('#currentInfo').replaceWith('<div class="currentInfo" id="currentInfo">' + firstName + ' ' + lastName + '<div></div>' + serverName + '</div>');
      $('#joinCommunityButton').replaceWith('<input class = "joinButton" type="button" value="Join" onclick="joinCommunity(\'' + userId + '\',\'' + server + '\')" id="joinCommunityButton">');
    }

  });

  var serverCommunitiesData = getCommunities(token, server);
  serverCommunitiesData.then(function(result) {
    appendCommunities(result, server);
  });

}


// appends all the servers communities to the community choice dropdown
function appendCommunities(data, server) {
  $('#communityChoiceDropdown').replaceWith('<select value="getCommunity" class="communityChoiceDropdown" id="communityChoiceDropdown" required></select>');

  for(var i = 0; i < data.length; i++){
    var title = data[i].title;
    var communityId = data[i]._id;
    $('#communityChoiceDropdown').append('<option value=\'' + communityId + '\'>' + title + '</option>');
  }
}


// appends all the users servers communities to their list of knowledge building communities
function appendUserCommunities(data, server) {
  $('#userCommunities').replaceWith("<ul class='userCommunities' id = 'userCommunities'></ul>");
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
    for(var i = 0; i < responses.length; i++){
      if(responses[i]){
        if(responses[i]._id){
          var title = data[i]._community.title;
          var id = data[i].communityId;
          var welcomeViewID = responses[i]._id;
          $('#userCommunities').append('<li><p>' + title + '</p><a href="' + server + 'auth/jwt?token=' + token + '&redirectUrl=/view/' + welcomeViewID + '" target="_blank"><button class="enterButton" type="button"><i class="far fa-arrow-alt-circle-right"></i></button></a></li>');
        }
      }

    }
  }).catch(function(error) {
    console.log(error);
  });
}

// registers the user for a community
function joinCommunity(userId, server){
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
    location.reload();
  });
}


// function to handle an expired/invalid user token
// called if response status is 401 (might be errors other than invalid token)
function tokenErrorHandler(){
  alert("User authorization token expired");
  logout();
}


// clears local storage of the username and their user tokens and redircts to the login page
function logout(){
  var uname = localStorage.getItem("Username");
  var userinfo = JSON.parse(localStorage.getItem(uname));

  if(uname == null || userinfo == null){
    localStorage.clear();
  } else {
    for(i in userinfo){
      userinfo[i][1] = "";
    }
    localStorage.setItem(uname, JSON.stringify(userinfo));
    localStorage.removeItem("Username");
  }

  window.location.href = "../index.html";

}


// function to add to buttons to toggle the side bar
function toggleSidebar(){
  var div = document.getElementById('wrapper');
  if (div.className == "d-flex") {
    div.className = "d-flex toggled";
  } else {
    div.className = "d-flex";
  }
}
