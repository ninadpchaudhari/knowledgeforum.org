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
          'label': "data(name)",
          // 'text-valign': 'center',
          // 'text-halign': 'right'
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

  //set nodeHtmlLabel for your Cy instance
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

  // on single click of node log its note id
  cy.on('tap', 'node', function(event){
    console.log('tapped note id: ' + this.data('noteId'));
  });


  // get demo user token and build graph
  var getTokenPromise = createDemoUserTokenPromise();
  getTokenPromise.then(function(result) {
    var token = result[0].token;

    var promise = getApiLinksFromViewId(token, SERVER, WELCOMEVIEWID);
    var promise1 = postApiLinksCommunityIdSearch(token, SERVER, COMMUNITYID, {type: "buildson"});
    var promise2 = getApiLinksReadStatus(token, SERVER, COMMUNITYID, WELCOMEVIEWID);
    var promise3 = getCommunityAuthors(token, SERVER, COMMUNITYID);

    Promise.all([promise, promise1, promise2, promise3]).then((result) => {

      // we keep a map with (key, value) of (noteId, count) in order to create duplicate notes with unique ids
      // simply append the count to the end of their note id
      var nodes = new Map();
      addNodesToGraph(cy, nodes, result[0], result[2], result[3]);
      addEdgesToGraph(cy, nodes, result[1]);

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


// uses serverurl/api/communities/communityId/authors endpoint
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


// adds the notes to the cytoscape graph
// parameters are cytoscape instance, notes map, getApiLinksFromViewId, getApiLinksReadStatus, and getCommunityAuthors results
function addNodesToGraph(cy, nodes, nodeData, readData, authorData){
  for(var i = 0; i < nodeData.length; i++){
    if(nodeData[i]._to.type === "Note" && nodeData[i]._to.title !== "" && nodeData[i]._to.status === "active"){
      var authorName = matchAuthorId(nodeData[i]._to.authors[0], authorData);
      var date = parseDate(nodeData[i].created);
      var className = readData.includes(nodeData[i].to) ? 'readNode' : 'node';

      // create the notes unique id
      // example id would be "5a0497f1ad39ced746109d6e-1"
      // the number fixed on the end is the count of that id on this view
      var id = "";
      if(nodes.has(nodeData[i].to)){
        nodes.set(nodeData[i].to, nodes.get(nodeData[i].to) + 1);
        id = nodeData[i].to + '-' + nodes.get(nodeData[i].to);
      } else {
        nodes.set(nodeData[i].to, 1);
        id = nodeData[i].to + '-1';
      }

      cy.add({
          data: {
            id: id,
            name: nodeData[i]._to.title,
            author: authorName,
            date: date,
            noteId: nodeData[i].to
          },
          classes: className,
          position: {
            x: nodeData[i].data.x,
            y: nodeData[i].data.y
          }
      });
    }
  }
}


// adds the edges to the cytoscape graph
// parameters are cytoscape instance, notes map, and postApiLinksCommunityIdSearch results
function addEdgesToGraph(cy, nodes, edgeData){
  for(var i = 0; i < edgeData.length; i++){
    var obj = edgeData[i];

    if(obj._to.type === "Note" && obj._to.status === "active" && obj._to.title != "" && obj._from.type === "Note" && obj._from.status === "active" && obj._from.title != ""){
        var fromCount = nodes.get(obj.from);
        var toCount = nodes.get(obj.to);
        if(fromCount !== 'undefined' && toCount !== 'undefined'){
          for(var j = 0; j < fromCount; j++){
            for(var k = 0; k < toCount; k++){
              cy.add({
                data: {
                  id: obj._id + '-' + (parseInt(j) + 1) + (parseInt(k) + 1),
                  source: obj.from + '-' + (parseInt(j) + 1),
                  target: obj.to + '-' + (parseInt(k) + 1)
                }
              });
            }
          }
        } else {
          console.log(obj.from + " fromCount: " + fromCount + "\n" + obj.to + " toCount: " + toCount);
        }
    }
  }
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
