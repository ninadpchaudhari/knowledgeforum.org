$(document).ready(function() {

  // initialize the graph
  var cy = cytoscape({
    container: document.getElementById('cy'), // container to render in

    elements: [],

    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#6ba6d6',
          'label': 'data(name)'
        }
      },

      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier'
        }
      }
    ],

    layout: {
      name: 'grid'
    },

    minZoom: 0.75,
    maxZoom: 2,
  });


  // get demo user token
  var getTokenPromise = createDemoUserTokenPromise();
  getTokenPromise.then(function(result) {
    var token = result[0].token;

    // use token to get all the notes from the welcome view
    var promise = getApiLinksFromViewId(token, SERVER, WELCOMEVIEWID);
    // use token to get all the edges for the welcome view
    var promise1 = postApiLinksCommunityIdSearch(token, SERVER, COMMUNITYID, {type: "buildson"});


    Promise.all([promise, promise1]).then((result) => {
      console.log(result);

      // first add the notes to the graph
      for(var i = 0; i < result[0].length; i++){
        if(result[0][i]._to.type === "Note" && result[0][i]._to.title !== "" && result[0][i]._to.status === "active"){
          console.log(result[0][i].to);
          cy.add({
              data: {
                id: result[0][i].to,
                name: result[0][i]._to.title
              },
              position: {
                x: result[0][i].data.x,
                y: result[0][i].data.y
              }
          });
        }
      }

      // second add the edges to the graph
      for(var i = 0; i < result[1].length; i++){
        var obj = result[1][i];
        if(obj._to.type === "Note" && obj._to.status === "active" && obj._to.title != "" && obj._from.type === "Note" && obj._from.status === "active" && obj._from.title != ""){
            cy.add({
              data: {
                id: obj._id,
                source: obj.from,
                target: obj.to
              }
            });
        }
      }

    });

  });

});



// creates a promise for the demo users token
function createDemoUserTokenPromise() {
  var body = {
    'userName': USERNAME,
    'password': PASSWORD
  };

  return fetch(SERVER + 'auth/local', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  }).then(function(response) {
    return response.json();
  }).then(function(body) {
    return ("Success:", [body, SERVER]);
  }).catch(function(error) {
    return ("Error:", error);
  });
}


// uses serverurl/api/links/from/viewId endpoint to get all
// links from the welcome view id
function getApiLinksFromViewId(token, server, welcomeViewId) {

  return fetch(server + 'api/links/from/' + welcomeViewId, {
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


// uses serverurl/api/objects/objectId endpoint
function getApiObjectsObjectId(token, server, objectId) {
    var request = new XMLHttpRequest();

    request.open('GET', server + 'api/objects/' + objectId);
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Bearer ' + token);

    request.onreadystatechange = function() {
      if (this.readyState === 4) {
        // console.log('Status:', this.status);
        // console.log('Headers:', this.getAllResponseHeaders());
        // console.log('Body:', this.responseText);
      }
    };

    request.send();
}


// uses serverurl/api/links/communityID/search
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
