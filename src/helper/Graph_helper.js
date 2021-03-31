import {getApiObjectsObjectId} from '../api/object.js';

// adds the notes to the cytoscape graph
// parameters are token, cytoscape instance, cytoscape-supportimage instance, notes map, getApiLinksFromViewId, getApiLinksReadStatus, and getCommunityAuthors results
export function addNodesToGraph(server, token, nodes, nodeData, authorData){
  var graph_nodes = [];
  for(var i = 0; i < nodeData.length; i++){
    var id = createCytoscapeId(nodes, nodeData[i].to);

    if(nodeData[i]._to.type === "Note" && nodeData[i]._to.title !== "" && nodeData[i]._to.status === "active"){
      graph_nodes.push(handleNote(id, nodeData[i], authorData));
    } else if(nodeData[i]._to.type === "Attachment" && nodeData[i]._to.title !== "" && nodeData[i]._to.status === "active"){
      graph_nodes.push(handleAttachment(server, token, nodes, nodeData[i], authorData));
    } else if(nodeData[i]._to.type === "Drawing" && nodeData[i]._to.title !== "" && nodeData[i]._to.status === "active"){
      graph_nodes.push(handleDrawing(server, token, nodes, nodeData[i], authorData));
    } else if(nodeData[i]._to.type === "View" && nodeData[i]._to.title !== "" && nodeData[i]._to.status === "active"){
      graph_nodes.push(handleView(nodes, nodeData[i]));
    }
  }

  return graph_nodes;
}


// adds the edges to the cytoscape graph
// parameters are cytoscape instance, notes map, and postApiLinksCommunityIdSearch results
export function addEdgesToGraph(nodes, edgeData){
  var graph_edges = [];
  for(var i = 0; i < edgeData.length; i++){
    var obj = edgeData[i];

    if(obj._to.type === "Note" && obj._to.status === "active" && obj._to.title !== "" && obj._from.type === "Note" && obj._from.status === "active" && obj._from.title !== ""){
        var fromCount = nodes.get(obj.from);
        var toCount = nodes.get(obj.to);
        if(fromCount !== 'undefined' && toCount !== 'undefined'){
          for(var j = 0; j < fromCount; j++){
            for(var k = 0; k < toCount; k++){
              graph_edges.push({
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
  return graph_edges;
}


// handles adding notes to the cytoscape instance
function handleNote(id, nodeData, authorData){
  var authorName = matchAuthorId(nodeData._to.authors[0], authorData);
  var date = parseDate(nodeData.created);
  var readStatus, type;

  // handles whether it is a note or a riseabove
  if(nodeData._to.data === undefined){
    readStatus = 'unread-note';
    type = "note";
  } else {
    readStatus = 'unread-riseabove';
    type = "riseabove";
  }

  return {
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
  };
}


// handles adding attachments to the cytoscape instance
function handleAttachment(server, token, nodes, nodeData, authorData){

  var authorName = matchAuthorId(nodeData._to.authors[0], authorData);
  var date = parseDate(nodeData.created);
  var id = createCytoscapeId(nodes, nodeData.to);

  return getApiObjectsObjectId(token, server, nodeData.to).then(function(result){
    if(String(result.data.type).substring(0,5) === "image"){
      var imageUrl =  (server + String(result.data.url).substring(1,)).replace(/\s/g,"%20");

      if(String(result.data.type).slice(-3) === "gif"){
        imageUrl = imageUrl.substring(0, imageUrl.length - 3) + "mp4";
      }

      var bounds = {
        x: nodeData.data.x || 0,
        y: nodeData.data.y || 0,
        width: nodeData.data.width || 0,
        height: nodeData.data.height || 0,
      };

      return {
        url: imageUrl,
        name: nodeData._to.title,
        bounds: bounds,
        locked: false,
          linkId: nodeData._id
      };

    } else {
      return {
        group: 'nodes',
        data: {
          id: id,
          name: nodeData._to.title,
          author: authorName,
          date: date,
          kfId: nodeData.to,
          type: nodeData._to.type,
          download: server + result.data.url.substring(1,)
        },
        classes: "attachment",
        position: {
          x: nodeData.data.x,
          y: nodeData.data.y
        }
      };
    }
  });
}


// handles adding drawings to the cytoscape instance
function handleDrawing(server, token, nodes, nodeData, authorData){

  return getApiObjectsObjectId(token, server, nodeData.to).then(function(result){
    var parser = new DOMParser();
    var doc = parser.parseFromString(result.data.svg, "image/svg+xml");

    // use width and height from svg tag to find the aspect ratio
    var svg_width = doc.childNodes[0].attributes.width.value;
    var svg_height = doc.childNodes[0].attributes.height.value;
    var aspect_ratio = svg_width/svg_height;

    // use the given width and known aspect ratio to calculate appropiate height for svg
    var node_width = parseInt(nodeData.data.width);
    var node_height = node_width/aspect_ratio;

    var bounds = {
      x: nodeData.data.x,
      y: nodeData.data.y,
      height: node_height,
      width: parseInt(nodeData.data.width)
    };

    return {
      url: 'data:image/svg+xml;utf8,' + encodeURIComponent('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>' + result.data.svg),
      name: nodeData._to.title,
      bounds: bounds,
      locked: false,
    };

  });
}


// handles adding a link to another view
function handleView(nodes, nodeData){
  var id = createCytoscapeId(nodes, nodeData.to);
  return {
    group: 'nodes',
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
  };
}


// helper function to find an authors name from their author id using the getCommunityAuthors data
function matchAuthorId(authorId, authorsInfo){
    for(let i in authorsInfo){
      if(authorId === authorsInfo[i]._id){
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
