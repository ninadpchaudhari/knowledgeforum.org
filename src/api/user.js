// returns a promise that on fullfillment returns the users token
export function getUserToken(username, password, server){
  var body = {
    'userName': username,
    'password': password
  };

  return fetch(server + 'auth/local', {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  }).then(function(response) {
      if(response.status !== 200){
        console.log("Error: " + server + 'auth/local');
        console.log(response);
      }
      return response.json();
  }).then(function(body) {
      return body;
  }).catch(function(error) {
      return ("Error:", error);
  });

}


// returns a promise that on fulfillment returns an [user token, server] object pair
export function getUserTokenServerPair(username, password, server){
  var body = {
    'userName': username,
    'password': password
  };

  return fetch(server + 'auth/local', {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  }).then(function(response) {
      if(response.status !== 200){
        console.log("Error: " + server + 'auth/local');
        console.log(response);
      }
      return response.json();
  }).then(function(body) {
      return [body, server];
  }).catch(function(error) {
      return ("Error:", error);
  });
}


// returns a promise that on fullfillment returns the user information corresponding to the given token and server
export function getUserInfo(token, server){

  return fetch(server + 'api/users/me', {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
  }).then(function(response) {
      if(response.status !== 200 && response.status !== 304){
        console.log("Error: " + server + "api/users/me");
        console.log(response);
        return {error: true};
      }
      return response.json();
  }).then(function(body) {
      return (body);
  }).catch(function(error) {
      return ("Error:", error);
  });

}


// returns a promse that on fulfillment returns the communities a user is registered to in a given server from their token
export function getUserCommunities(token, server){
  return fetch(server + 'api/users/myRegistrations', {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
  }).then(function(response) {
    if(response.status !== 200){
      console.log("Error: " + server + 'api/users/myRegistrations');
      console.log(response);
    }
    return response.json();
  }).then(function(body) {
      return (body);
  }).catch(function(error) {
      return ("Error:", error);
  });
}
