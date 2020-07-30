$(document).ready(function() {

  // loads users servers to the sidebar and sets the active server
  appendUserServers();

});

// adds the users servers to the side bar
function appendUserServers(){
  var uname = localStorage.key(0);
  var data = JSON.parse(localStorage.getItem(uname));
  var serverList = document.getElementById("server-list");

  for(i in data){
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
     var url = data[i][0];
     var token = data[i][1];
     var status = (url == activeServerURL) ? "active" : "inactive";
     serverTokenPair.push([url, token, status]);
   }

   var uname = localStorage.getItem("Username");
   localStorage.setItem(uname, JSON.stringify(serverTokenPair));
  });

}

// replaces the "join community" and "my knowledge building communities" sections
// with the relevant information for the specified server
function loadServer(url){

  var serverCommunitiesData = getCommunities(url);
  serverCommunitiesData.then(function(result) {
    appendCommunities(result);
  });

  var userCommunitiesData = getUserCommunities(url);
  userCommunitiesData.then(function(result) {
    appendUserCommunities(result, url);
  });

  var userInfo = getUserInfo(url);
  userInfo.then(function(result) {
    var firstName = result.firstName;
    var lastName = result.lastName;
    var server = getServerName(url);
    $('#currentInfo').replaceWith('<div class="currentInfo" id="currentInfo">' + firstName + ' ' + lastName + '<div></div>' + server + '</div>');
  });

}


// returns the users token for the specified server
function extractTokenFromStorage(url) {
  var uname = localStorage.getItem("Username");
  var data = JSON.parse(localStorage.getItem(uname));

  for (i in data) {
    if (data[i][0] == url) {
      return data[i][1];
    }
  }
}


// retrieves the users information for the specified server
function getUserInfo(url) {
  var token = extractTokenFromStorage(url);

  return fetch(url + 'api/users/me', {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
  }).then(function(response) {
      if(response.status == 401){
        tokenErrorHandler();
      } else {
        return response.json();
      }
  }).then(function(body) {
      return (body);
  }).catch(function(error) {
      return ("Error:", error);
  });
}


// returns a promise for all the communities from the specified server
function getCommunities(url) {
  var token = extractTokenFromStorage(url);

  return fetch(url + 'api/communities', {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
  }).then(function(response) {
    if(response.status == 401){
      tokenErrorHandler();
    } else {
      return response.json();
    }
  }).then(function(body) {
      return (body);
  }).catch(function(error) {
      return ("Error:", error);
  });
}


// appends all the servers communities to the community choice dropdown
function appendCommunities(data) {
  $('#communityChoiceDropdown').replaceWith('<select value="getCommunity" class="communityChoiceDropdown" id="communityChoiceDropdown" required></select>');

  for(var i = 0; i < data.length; i++){
    var title = data[i].title;
    $('#communityChoiceDropdown').append('<option>' + title + '</option>');
  }
}


// returns a promise for all the communities a user is a part of in the specified server
function getUserCommunities(url) {
  var token = extractTokenFromStorage(url);

  return fetch(url + 'api/users/myRegistrations', {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
  }).then(function(response) {
    if(response.status == 401){
      tokenErrorHandler();
    } else {
      return response.json();
    }
  }).then(function(body) {
      return (body);
  }).catch(function(error) {
      return ("Error:", error);
  });

}


// appends all the users servers communities to their list of knowledge building communities
function appendUserCommunities(data, url) {
  $('#userCommunities').replaceWith("<ul class='userCommunities' id = 'userCommunities'></ul>");

  for(var i = 0; i < data.length; i++){
    var title = data[0]._community.title;
    var id = data[0].communityId;
    $('#userCommunities').append('<li><p>' + title + '</p><button class="enterButton" type="button" onclick="enterCommunity(\'' + id + '\', \'' + url + '\')"><i class="far fa-arrow-alt-circle-right"></i></button></li>');
  }

}


// retrieves the views from the specified community
function getCommunityViews(communityId, url){
  var token = extractTokenFromStorage(url);

  // retrieve the communities views here
  return fetch(url + 'api/communities/' + communityId + '/views', {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    redirect: "follow"
  }).then(function(response) {
    if(response.status == 401){
      tokenErrorHandler();
    } else {
      return response.json();
    }
  }).then(function(body) {
      return (body);
  }).catch(function(error) {
      return ("Error:", error);
  });
}


// redirects the user to enter the specified community
function enterCommunity(communityId, url){
  var token = extractTokenFromStorage(url);
  var communityViews = getCommunityViews(communityId, url);

  communityViews.then(function(result){
    var welcomeViewID = result[0]._id;

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
    myHeaders.append("Authorization", "Bearer " + token);

    var urlencoded = new URLSearchParams();
    urlencoded.append("redirectUrl", url + 'view/' + welcomeViewID);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow"
    };

    fetch(url + "auth/jwt", requestOptions)
      .then(response => response.text())
      .then(result => window.open(url + "view/" + welcomeViewID, "_blank"))
      .catch(error => console.log('error', error));

  })
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
