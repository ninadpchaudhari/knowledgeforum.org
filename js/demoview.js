$(document).ready(function() {
  var cytoscape = require('cytoscape');
  var nodeHtmlLabel = require('cytoscape-node-html-label');
  var supportimages = require('cytoscape-supportimages');
  var panzoom = require('cytoscape-panzoom');
  nodeHtmlLabel( cytoscape );
  supportimages( cytoscape );
  panzoom( cytoscape );

  const MINZOOM = 0.75;
  const MAXZOOM = 2;

  // CYTOSCAPE
  var cy = cytoscape({
    container: document.getElementById('cy'), // container to render in
    elements: [],
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'label': "data(name)",
          'background-opacity': '0',
          'background-clip': 'none',
          'background-width': '25px',
          'background-height': '25px'
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
      },

      {selector: '.unread-note', style: {'background-image': ["../assets/icon_note_blue.png"]}},
      {selector: '.read-note', style: {'background-image': ["../assets/icon_note_red.png"]}},
      {selector: '.unread-riseabove', style: {'background-image': ["../assets/icon_riseabove_blue.png"]}},
      {selector: '.read-riseabove', style: {'background-image': ["../assets/icon_riseabove_red.png"]}},
      {selector: '.attachment', style: {'background-image': ["../assets/icon_attachment.gif"]}},
      {
        selector: '.image',
        style: {
          'background-opacity': '0',
          'label': ''
        }
      }
    ],

    layout: {
      name: 'grid',
      animate: 'true'
    },

    minZoom: MINZOOM,
    maxZoom: MAXZOOM,
    wheelSensitivity: 0.15
  });

  // CYTOSCAPE-NODE-HTML-LABEL EXTENSION
  cy.nodeHtmlLabel([
    {
      query: 'node',
      halign: 'center', // title vertical position. Can be 'left',''center, 'right'
      valign: 'bottom', // title vertical position. Can be 'top',''center, 'bottom'
      halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
      valignBox: 'bottom', // title relative box vertical position. Can be 'top',''center, 'bottom'
      cssClass: '', // any classes will be as attribute of <div> container for every title
      tpl: function(data){
        // we do not want author and date listed for images
        if(data.type == "Attachment" && data.isImage == true){
          return '';
        };
        return '<div class = "cytoscape-label">' + data.author + '<br>' + data.date + '</div>';
      }
    },
  ]);

  // CYTOSCAPE-SUPPORTIMAGES EXTENSION
  // var si = cy.supportimages();
  // si.addSupportImage({
  //   url: "http://localhost:9000/attachments/5f5009eb1beff90212b92dd3/5f57fc12d6d0de00d4d7b271/1/82423903_113435220202457_6526867001489489920_o.jpg",
  //   name: "test"
  // });
  //
  // var imgs = si.images();

  // CYTOSCAPE-PANZOOM EXTENSION
  // the default values of each option are outlined below:
  var defaults = {
    zoomFactor: 0.05, // zoom factor per zoom tick
    zoomDelay: 45, // how many ms between zoom ticks
    minZoom: MINZOOM, // min zoom level
    maxZoom: MAXZOOM, // max zoom level
    fitPadding: 50, // padding when fitting
    panSpeed: 10, // how many ms in between pan ticks
    panDistance: 10, // max pan distance per tick
    panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
    panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
    panInactiveArea: 8, // radius of inactive area in pan drag box
    panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
    zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
    fitSelector: undefined, // selector of elements to fit
    animateOnFit: function(){ // whether to animate on fit
      return false;
    },
    fitAnimationDuration: 1000, // duration of animation on fit

    // icon class names
    sliderHandleIcon: 'fa fa-minus',
    zoomInIcon: 'fa fa-plus',
    zoomOutIcon: 'fa fa-minus',
    resetIcon: 'fa fa-expand'
  };

  // add the panzoom control
  cy.panzoom( defaults );



  // get demo user token and build graph
  var getTokenPromise = createDemoUserTokenPromise();
  getTokenPromise.then(function(result) {
    var token = result[0].token;

    var promise = getApiLinksFromViewId(token, SERVER, WELCOMEVIEWID);
    var promise1 = postApiLinksCommunityIdSearch(token, SERVER, COMMUNITYID, {type: "buildson"});
    var promise2 = getApiLinksReadStatus(token, SERVER, COMMUNITYID, WELCOMEVIEWID);
    var promise3 = getCommunityAuthors(token, SERVER, COMMUNITYID);

    Promise.all([promise, promise1, promise2, promise3]).then((result) => {

      // we keep a map with (key, value) of (kfId, count) in order to create duplicate notes with unique ids
      // simply append the count to the end of their note id
      var nodes = new Map();
      addNodesToGraph(token, cy, nodes, result[0], result[2], result[3]);
      addEdgesToGraph(cy, nodes, result[1]);

    });


    // on single click of node log its kf id and mark it as read
    cy.on('tap', 'node', function(event){
      var kfId = this.data('kfId');
      var type = this.data('type');
      console.log('tapped note id: ' + kfId);

      if(this.hasClass("image")){
        console.log("image");
      } else if(this.hasClass("attachment")){
        window.open(this.data('download'));
      } else {
        if(type == "riseabove"){
          this.removeClass("unread-riseabove");
          this.addClass("read-riseabove");
        } else if(type == "note"){
          this.removeClass("unread-note");
          this.addClass("read-note");
        }

        postReadStatus(token, SERVER, COMMUNITYID, kfId);
      }
    });

  });


  // add event listeners to the layout dropdown options
  // need to do it here to have access to cytoscape instance
  var options = document.getElementsByClassName("layout-option");
  for(let i = 0; i < options.length; i++){
    options[i].addEventListener('click', function(event){
      cy.layout({name: this.getAttribute("value")}).run();
    });
  }

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


// used to mark an object as read
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
// parameters are token, cytoscape instance, notes map, getApiLinksFromViewId, getApiLinksReadStatus, and getCommunityAuthors results
function addNodesToGraph(token, cy, nodes, nodeData, readData, authorData){
  for(var i = 0; i < nodeData.length; i++){

    var id = createCytoscapeId(nodes, nodeData[i].to);

    if(nodeData[i]._to.type === "Note" && nodeData[i]._to.title !== "" && nodeData[i]._to.status === "active"){
      handleNote(cy, id, nodeData[i], readData, authorData);
    } else if(nodeData[i]._to.type === "Attachment" && nodeData[i]._to.title !== "" && nodeData[i]._to.status === "active"){
      handleAttachment(token, cy, nodes, nodeData[i], authorData);
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
                group: 'edges',
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


// handles adding notes to the cytoscape instance
function handleNote(cy, id, nodeData, readData, authorData){
  var authorName = matchAuthorId(nodeData._to.authors[0], authorData);
  var date = parseDate(nodeData.created);
  var readStatus, type;

  // handles whether it is a note or a riseabove
  if(nodeData._to.data == undefined){
    readStatus = readData.includes(nodeData.to) ? 'read-note' : 'unread-note';
    type = "note";
  } else {
    readStatus = readData.includes(nodeData.to) ? 'read-riseabove' : 'unread-riseabove';
    type = "riseabove";
  }

  cy.add({
      group: 'nodes',
      data: {
        id: id,
        name: nodeData._to.title,
        author: authorName,
        date: date,
        kfId: nodeData.to,
        type: type
      },
      classes: readStatus,
      position: {
        x: nodeData.data.x,
        y: nodeData.data.y
      }
  });

}


// handles adding attachments to the cytoscape instance
function handleAttachment(token, cy, nodes, nodeData, authorData){

  var authorName = matchAuthorId(nodeData._to.authors[0], authorData);
  var date = parseDate(nodeData.created);
  var id = createCytoscapeId(nodes, nodeData.to);

  var documentInfo = getApiObjectsObjectId(token, SERVER, nodeData.to);
  documentInfo.then(function(result){
    var isImage = String(result.data.type).substring(0,5) === "image" ? true : false;
    if(isImage){
      cy.add({
        data: {
          id: id,
          name: nodeData._to.title,
          author: authorName,
          date: date,
          kfId: nodeData.to,
          type: nodeData._to.type,
          isImage: true,
        },
        style: {
          'background-image': (SERVER + String(result.data.url).substring(1,)).replace(/\s/g,"%20"),
          'height': nodeData.data.height,
          'width': nodeData.data.width,
          'background-height': nodeData.data.height,
          'background-width': nodeData.data.width,
        },
        classes: "image",
        position: {
          x: nodeData.data.x,
          y: nodeData.data.y
        }
      });

    } else {
      cy.add({
        group: 'nodes',
        data: {
          id: id,
          name: nodeData._to.title,
          author: authorName,
          date: date,
          kfId: nodeData.to,
          type: nodeData._to.type,
          isImage: false,
          download: SERVER + result.data.url.substring(1,)
        },
        classes: "attachment",
        position: {
          x: nodeData.data.x,
          y: nodeData.data.y
        }
      });
    }
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


// returns a unique cytoscape id corresponding to the given kf id
function createCytoscapeId(nodes, kfId){
  // create the notes unique id
  // example id would be "5a0497f1ad39ced746109d6e-1"
  // the number fixed on the end is the count of that id on this view
  if(nodes.has(kfId)){
    nodes.set(kfId, nodes.get(kfId) + 1);
    return kfId + '-' + nodes.get(kfId);
  } else {
    nodes.set(kfId, 1);
    return kfId + '-1';
  }
}
