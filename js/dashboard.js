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
    appendCommunities(result, url);
  });

  var userCommunitiesData = getUserCommunities(url);
  userCommunitiesData.then(function(result) {
    appendUserCommunities(result, url);
  });

  var userInfo = getUserInfo(url);
  userInfo.then(function(result) {
    var firstName = result.firstName;
    var lastName = result.lastName;
    var userId = result._id;
    var server = getServerName(url);
    $('#currentInfo').replaceWith('<div class="currentInfo" id="currentInfo">' + firstName + ' ' + lastName + '<div></div>' + server + '</div>');
    $('#joinCommunityButton').replaceWith('<input class = "joinButton" type="button" value="Join" onclick="joinCommunity(\'' + userId + '\',\'' + url + '\')" id="joinCommunityButton">')
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
      return response.json();
  }).then(function(body) {
      return (body);
  }).catch(function(error) {
      return ("Error:", error);
  });
}


// appends all the servers communities to the community choice dropdown
function appendCommunities(data, url) {
  $('#communityChoiceDropdown').replaceWith('<select value="getCommunity" class="communityChoiceDropdown" id="communityChoiceDropdown" required></select>');

  for(var i = 0; i < data.length; i++){
    var title = data[i].title;
    var communityId = data[i]._id;
    $('#communityChoiceDropdown').append('<option value=\'' + communityId + '\'>' + title + '</option>');
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
    return response.json();
  }).then(function(body) {
      return (body);
  }).catch(function(error) {
      return ("Error:", error);
  });

}


// appends all the users servers communities to their list of knowledge building communities
function appendUserCommunities(data, url) {
  $('#userCommunities').replaceWith("<ul class='userCommunities' id = 'userCommunities'></ul>");
  var token = extractTokenFromStorage(url);
  var promises = [];

  // for loop to create promises to get welcome view IDs for each community
  for(var i = 0; i < data.length; i++){
    var id = data[i].communityId;
    const p = new Promise((resolve, reject) => {
      var welcomeViewID = getCommunityViews(id, url).then(function(result) {
        if(result[0]._id){
          return result[0]._id;
        } else {
          console.log(result[0]._id);
        }
      })
      resolve(welcomeViewID);
    })

    promises.push(p);
  }

  // execute all promises
  Promise.all(promises).then(function(responses) {
    return Promise.all(responses.map(function (response) {
      return response;
    }));
  }).then(function(body) {
    // here we use the welcome view id, title, and communityId to create each list entry
    // body and data are same length
    for(var i = 0; i < body.length; i++){
      var title = data[i]._community.title;
      var id = data[i].communityId;
      var welcomeViewID = body[i];
      $('#userCommunities').append('<li><p>' + title + '</p><a href="' + url + 'auth/jwt?token=' + token + '&redirectUrl=/view/' + welcomeViewID + '" target="_blank"><button class="enterButton" type="button"><i class="far fa-arrow-alt-circle-right"></i></button></a></li>');
    }
  }).catch(function(error) {
    console.log(error);
  });

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
  }).then(function(response) {
    return response.json();
  }).then(function(body) {
      return (body);
  }).catch(function(error) {
      return ("Error:", error);
  });
}


// registers the user for a community
function joinCommunity(userId, url){
  var selectCommunityDropdown = document.getElementById("communityChoiceDropdown");
  var communityId = selectCommunityDropdown.options[selectCommunityDropdown.selectedIndex].value;
  var registrationKey = document.getElementById("communityKey").value;
  var token = extractTokenFromStorage(url);

  var body = {
    'communityId': communityId,
    'registrationKey': registrationKey,
    'userId': userId
  };

  var promise = fetch(url + 'api/authors', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(body),
  }).then(function(response) {
      if(response.status == 400){
        var errorMessageDiv = document.getElementById("errorMessage");
        errorMessageDiv.innerHTML = "Registration key does not match or you are already registered.";
        errorMessageDiv.style.display = "visible";
      } else {
        return response.json();
      }
  }).then(function(body) {
      return ("Success:", [body, url]);
  }).catch(function(error) {
      return ("Error:", error);
  });

  promise.then(result => new Promise(resolve => {
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
