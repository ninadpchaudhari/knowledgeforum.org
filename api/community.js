// returns a promise that on fullfillment returns all the communities from the specified server
function getCommunities(token, server) {
  return fetch(server + 'api/communities', {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
  }).then(function(response) {
    if(response.status != 200){
      console.log("Error: " + server + 'api/communities');
      console.log(response);
    }
      return response.json();
  }).then(function(body) {
      return (body);
  }).catch(function(error) {
      return ("Error:", error);
  });
}


// returns a promise that on fullfillment returns all the views from the specified community on the specified server
function getCommunityViews(token, communityId, server){
  return fetch(server + 'api/communities/' + communityId + '/views', {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
  }).then(function(response) {
    if(response.status != 200){
      console.log("Error: " + server + 'api/communities/' + communityId + '/views');
      console.log(response);
    }
    return response.json();
  }).then(function(body) {
      return (body);
  }).catch(function(error) {
      return ("Error:", error);
  });
}


// returns a promise that on fullfillment returns the welcome view from the specified community on the specified server
function getCommunityWelcomeView(token, communityId, server){
  return fetch(server + 'api/communities/' + communityId + '/views', {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
  }).then(function(response) {
    if(response.status != 200){
      console.log("Error: " + server + 'api/communities/' + communityId + '/views');
      console.log(response);
    }
    return response.json();
  }).then(function(body) {
      return (body[0]);
  }).catch(function(error) {
      return ("Error:", error);
  });
}


// returns a promise that on fullfillment returns the authors from the specified community on the specified server
function getCommunityAuthors(token, communityId, server){
  return fetch(server + 'api/communities/' + communityId + '/authors', {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
  }).then(function(response) {
    if(response.status != 200){
      console.log("Error: " + server + 'api/communities/' + communityId + '/authors');
      console.log(response);
    }
    return response.json();
  }).then(function(body) {
    return (body);
  }).catch(function(error) {
    return ("Error:", error);
  });
}


// registers a given user to the specified community on the specified server
function postCommunityRegistration(token, communityId, server, userId, registrationKey){
  var body = {
    'communityId': communityId,
    'registrationKey': registrationKey,
    'userId': userId
  };

  return fetch(server + 'api/authors', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(body),
  }).then(function(response) {
      if(response.status != 201){
        console.log("Error: " + server + 'api/authors');
        console.log(response);
        return {error: true};
      }
      return response.json();
  }).then(function(body) {
      return ("Success:", [body, server]);
  }).catch(function(error) {
      return ("Error:", error);
  });
}
