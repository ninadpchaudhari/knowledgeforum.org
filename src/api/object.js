// returns a promise that on fullfillment returns the object given by objectId
export function getApiObjectsObjectId(token, server, objectId) {
  return fetch(server + 'api/objects/' + objectId, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
  }).then(function(response) {
    if(response.status !== 200){
      console.log("Error: " + server + 'api/objects/' + objectId);
      console.log(response);
    }
    return response.json();
  }).then(function(body) {
    return (body);
  }).catch(function(error) {
    return ("Error:", error);
  });
}
