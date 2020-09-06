$(document).ready(function() {

  var cytoscape = require('cytoscape');
  var nodeHtmlLabel = require('cytoscape-node-html-label');
  nodeHtmlLabel( cytoscape ); // register extension

  // initialize the graph
  var cy = cytoscape({
    container: document.getElementById('cy'), // container to render in
    elements: [],
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#6ba6d6',
          'label': "data(name)"
        }
      },

      {
        selector: '.readNode',
        style: {
          'background-color': '#E87259',
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

  // set nodeHtmlLabel for your Cy instance
  cy.nodeHtmlLabel([
    {
      query: 'node',
      halign: 'center', // title vertical position. Can be 'left',''center, 'right'
      valign: 'bottom', // title vertical position. Can be 'top',''center, 'bottom'
      halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
      valignBox: 'bottom', // title relative box vertical position. Can be 'top',''center, 'bottom'
      cssClass: '', // any classes will be as attribute of <div> container for every title
      tpl: function(data){
        return '<div class = "cytoscape-label">' + data.author + '<br>' + data.date + '</div>';
      }
    }
  ]);


  // get demo user token and build graph
  var getTokenPromise = createDemoUserTokenPromise();
  getTokenPromise.then(function(result) {
    var token = result[0].token;

    var promise = getApiLinksFromViewId(token, SERVER, WELCOMEVIEWID);
    var promise1 = postApiLinksCommunityIdSearch(token, SERVER, COMMUNITYID, {type: "buildson"});
    var promise2 = getApiLinksReadStatus(token, SERVER, COMMUNITYID, WELCOMEVIEWID);
    var promise3 = getCommunityAuthors(token, SERVER, COMMUNITYID);

    Promise.all([promise, promise1, promise2, promise3]).then((result) => {

      // first add the notes to the graph
      for(var i = 0; i < result[0].length; i++){
        if(result[0][i]._to.type === "Note" && result[0][i]._to.title !== "" && result[0][i]._to.status === "active"){
          var authorName = matchAuthorId(result[0][i]._to.authors[0], result[3]);
          var date = parseDate(result[0][i].created);
          var className = result[2].includes(result[0][i].to) ? 'readNode' : 'node';
          cy.add({
              data: {
                id: result[0][i].to,
                name: result[0][i]._to.title,
                author: authorName,
                date: date,
              },
              classes: className,
              position: {
                x: result[0][i].data.x,
                y: result[0][i].data.y
              }
          });
        }
      }

      // second add the edges
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


// gets the data for read status of the notes
// RETURNS ARRAY OF THE READ NOTE IDS ONLY
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


// uses serverurl/api/objects/objectId endpoint
function getApiObjectsObjectId(token, server, objectId) {

  return fetch(server + 'api/objects/' + objectId, {
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


function getCommunityAuthors(token, server, communityId) {

  return fetch(server + 'api/communities/' + communityId + '/authors', {
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


// helper function to find an authors name from their author id using the getCommunityAuthors data
function matchAuthorId(authorId, authorsInfo){
    for(var i = 0; i < authorsInfo.length; i++){
      if(authorId == authorsInfo[i]._id){
        return authorsInfo[i].firstName + " " + authorsInfo[i].lastName;
      }
    }
    return "Author not found";
}

// helper function to return formatted creation date of a note
function parseDate(date){
  var year = date.substring(0, 4);
  var month = date.substring(5, 7);
  var day = date.substring(8, 10);
  var hour = date.substring(11, 13);
  var minute = date.substring(14, 16);
  var second = date.substring(17, 19);
  if(hour < 12){
    return(month + "/" + day + "/" + year + ", " + hour + ":" + minute + ":" + second + " AM");
  } else {
    return(month + "/" + day + "/" + year + ", " + (hour - 12) + ":" + minute + ":" + second + " PM");
  }
}
