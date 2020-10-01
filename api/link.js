// returns a promise that on fullfillment returns all links from the given viewId
function getApiLinksFromViewId(token, server, viewId) {
  return fetch(server + 'api/links/from/' + viewId, {
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


// returns a promise that on fullfillment returns all links FROM ID to TO ID  
function getApiLinksViewIdToObjectId(token, server, viewId, objectId) {
  return fetch(server + 'api/links/from/' + viewId + '/to/' + objectId, {
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

// returns a promise that on fullfillment returns an array of the read note ids only
function getApiLinksReadStatus(token, server, communityId, welcomeViewId){
  return fetch(server + 'api/records/myreadstatusview/' + communityId + '/' + welcomeViewId, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
  }).then(function(response) {
    return response.json();
  }).then(function(body) {
    var results = [];
    for(var i in body){
      if(body[i].type == "read"){ results.push(body[i].to); }
    }
    return (results);
  }).catch(function(error) {
    return ("Error:", error);
  });
}


// used to mark notes as read according to the given parameters
function postReadStatus(token, server, communityId, contributionId){
  return fetch(server + 'api/records/read/' + communityId + '/' + contributionId, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
  }).then(function(response) {
    return response.json();
  }).then(function(body) {
    return body
  }).catch(function(error) {
    return ("Error:", error);
  });
}


// returns a promise that on fullfillment returns all of the links fulfilling the query
function postApiLinksCommunityIdSearch(token, server, communityId, query) {
  var body = {
    'query': query
  };

  return fetch(server + 'api/links/' + communityId + '/search', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(body),
  }).then(function(response) {
    return response.json();
  }).then(function(body) {
    return (body);
  }).catch(function(error) {
    return ("Error:", error);
  });
}
