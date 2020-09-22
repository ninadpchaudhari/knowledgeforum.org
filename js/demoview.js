/*
* EDIT VALUES FOR iFRAME SAMPLE VIEW HERE
*/
// const USERNAME = "admin";
// const PASSWORD = "build";
// const SERVER = getServerURL("Local");
// const viewId = "5f5009ec1beff90212b92dd6"; // TEST COMMUNITY WELCOME VIEW ID
// const COMMUNITYID = "5f5009eb1beff90212b92dd3" // TEST COMMUNITY ID

// KF How To - KB RESOURCES
const USERNAME = "cytoscape";
const PASSWORD = "cytoscape";
const SERVER = getServerURL("Albany Stage");
const COMMUNITYID = "5ea995a6cbdc04a6f53a1b5c"
var viewId = sessionStorage.getItem("viewId") === null ? "5ea995a7cbdc04a6f53a1b5f" : sessionStorage.getItem("viewId");


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
      {selector: '.view', style: {'background-image': ["../assets/icon_view.png"]}},
      {
        selector: '.image',
        style: {
          'label': ''
        }
      },
      {
        selector: '.drawing',
        style: {
          'label': ''
        }
      }
    ],

    layout: {
      name: 'grid',
    },

    minZoom: MINZOOM,
    maxZoom: MAXZOOM,
    wheelSensitivity: 0.15
  });

  // CYTOSCAPE-NODE-HTML-LABEL EXTENSION
  cy.nodeHtmlLabel([
    // {
    //   query: 'node',
    //   halign: 'center', // title vertical position. Can be 'left',''center, 'right'
    //   valign: 'bottom', // title vertical position. Can be 'top',''center, 'bottom'
    //   halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
    //   valignBox: 'bottom', // title relative box vertical position. Can be 'top',''center, 'bottom'
    //   cssClass: '', // any classes will be as attribute of <div> container for every title
    //   tpl: function(data){
    //     // we only want author and creation date listed for notes
    //     if(data.type === 'note'){
    //       return '<div class = "cytoscape-label">' + data.author + '<br>' + data.date + '</div>';
    //     } else {
    //       return '';
    //     }
    //   }
    // },
  ]);

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
  var getTokenPromise = getUserToken(USERNAME, PASSWORD, SERVER);
  getTokenPromise.then(function(result) {
    var token = result.token;

    var promise = getApiLinksFromViewId(token, SERVER, viewId);
    var promise1 = postApiLinksCommunityIdSearch(token, SERVER, COMMUNITYID, {type: "buildson"});
    var promise2 = getApiLinksReadStatus(token, SERVER, COMMUNITYID, viewId);
    var promise3 = getCommunityAuthors(token, COMMUNITYID, SERVER);

    Promise.all([promise, promise1, promise2, promise3]).then((result) => {

      // we keep a map with (key, value) of (kfId, count) in order to create duplicate notes with unique ids
      // simply append the count to the end of their note id
      var nodes = new Map();
      var si = cy.supportimages();

      addNodesToGraph(token, cy, si, nodes, result[0], result[2], result[3]);
      addEdgesToGraph(cy, nodes, result[1]);

      var imgs = si.images();

    });


    // on single click of node log its kf id and mark it as read
    cy.on('tap', 'node', function(event){
      var kfId = this.data('kfId');
      var type = this.data('type');
      console.log(this);

      if(this.hasClass("image")){
        console.log("image");
        console.log(this);
      // WORD DOCUMENTS ARE STILL UNREADABLE ON OPEN AFTER DOWNLOAD
      } else if(this.hasClass("attachment")){
        window.open(this.data('download'));

      } else if(this.hasClass("view")){
        sessionStorage.setItem("viewId", kfId);
        location.reload();
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


// adds the notes to the cytoscape graph
// parameters are token, cytoscape instance, cytoscape-supportimage instance, notes map, getApiLinksFromViewId, getApiLinksReadStatus, and getCommunityAuthors results
function addNodesToGraph(token, cy, si, nodes, nodeData, readData, authorData){
  for(var i = 0; i < nodeData.length; i++){

    var id = createCytoscapeId(nodes, nodeData[i].to);

    if(nodeData[i]._to.type === "Note" && nodeData[i]._to.title !== "" && nodeData[i]._to.status === "active"){
      handleNote(cy, id, nodeData[i], readData, authorData);
    } else if(nodeData[i]._to.type === "Attachment" && nodeData[i]._to.title !== "" && nodeData[i]._to.status === "active"){
      handleAttachment(token, cy, si, nodes, nodeData[i], authorData);
    } else if(nodeData[i]._to.type === "Drawing" && nodeData[i]._to.title !== "" && nodeData[i]._to.status === "active"){
      handleDrawing(token, cy, si, nodes, nodeData[i], authorData);
    } else if(nodeData[i]._to.type === "View" && nodeData[i]._to.title !== "" && nodeData[i]._to.status === "active"){
      handleView(cy, nodes, nodeData[i]);
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
function handleAttachment(token, cy, si, nodes, nodeData, authorData){

  var authorName = matchAuthorId(nodeData._to.authors[0], authorData);
  var date = parseDate(nodeData.created);
  var id = createCytoscapeId(nodes, nodeData.to);

  var documentInfo = getApiObjectsObjectId(token, SERVER, nodeData.to);
  documentInfo.then(function(result){
    var isImage = String(result.data.type).substring(0,5) === "image" ? true : false;
    if(isImage){

      var bounds = si.rectangle({
        x: nodeData.data.x,
        y: nodeData.data.y,
        width: nodeData.data.width,
        height: nodeData.data.height,
      });
      si.addSupportImage({
        url: (SERVER + String(result.data.url).substring(1,)).replace(/\s/g,"%20"),
        name: nodeData._to.title,
        bounds: bounds
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


// handles adding drawings to the cytoscape instance
function handleDrawing(token, cy, si, nodes, nodeData, authorData){

  var authorName = matchAuthorId(nodeData._to.authors[0], authorData);
  var date = parseDate(nodeData.created);
  var id = createCytoscapeId(nodes, nodeData.to);

  var documentInfo = getApiObjectsObjectId(token, SERVER, nodeData.to);
  documentInfo.then(function(result){
    var parser = new DOMParser();
    var doc = parser.parseFromString(result.data.svg, "image/svg+xml");

    var bounds = si.rectangle({
      x: nodeData.data.x,
      y: nodeData.data.y,
      width: doc.childNodes[0].attributes.width.value,
      height: doc.childNodes[0].attributes.height.value,
    });
    si.addSupportImage({
      url: 'data:image/svg+xml;utf8,' + encodeURIComponent(result.data.svg),
      name: nodeData._to.title,
      bounds: bounds
    });

  });

}


// handles adding a link to another view
function handleView(cy, nodes, nodeData){
  var id = createCytoscapeId(nodes, nodeData.to);
  cy.add({
    data: {
      id: id,
      name: nodeData._to.title,
      kfId: nodeData.to,
      type: nodeData._to.type,
      communityId: nodeData.communityId,
    },
    classes: "view",
    position: {
      x: nodeData.data.x,
      y: nodeData.data.y
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
