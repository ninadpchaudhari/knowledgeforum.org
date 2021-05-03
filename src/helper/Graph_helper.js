import {getApiObjectsObjectId} from '../api/object.js';

// adds the notes to the cytoscape graph
export function addNodesToGraph(server, token, nodes, nodeData, authorData, viewSettings, groups){
  var graph_nodes = [];
  for(var i = 0; i < nodeData.length; i++){

    if(nodeData[i]._to.type === "Note" && nodeData[i]._to.title !== "" && nodeData[i]._to.status === "active"){
      var id = createCytoscapeId(nodes, nodeData[i].to);
      graph_nodes.push(handleNote(server, token, id, nodeData[i], authorData, viewSettings, groups));
    } else if(nodeData[i]._to.type === "Attachment" && nodeData[i]._to.title !== "" && nodeData[i]._to.status === "active"){
      graph_nodes.push(handleAttachment(server, token, nodes, nodeData[i], authorData, viewSettings, groups));
    } else if(nodeData[i]._to.type === "Drawing" && nodeData[i]._to.title !== "" && nodeData[i]._to.status === "active"){
      graph_nodes.push(handleDrawing(server, token, nodes, nodeData[i], authorData));
    } else if(nodeData[i]._to.type === "View" && nodeData[i]._to.title !== "" && nodeData[i]._to.status === "active"){
      graph_nodes.push(handleView(nodes, nodeData[i], authorData));
    }
  }

  return graph_nodes;
}


// adds the edges to the cytoscape graph
export function addEdgesToGraph(nodes, buildson, references, viewSettings){
  var graph_edges = [];
  var edgeData = buildson.concat(references);
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
                },
                classes: obj.type,
                initialDisplay: viewSettings[obj.type],
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
function handleNote(server, token, id, nodeData, authorData, viewSettings, groups){
  var authorName = matchAuthorId(nodeData._to.authors[0], authorData);
  var date = parseDate(nodeData.created);
  var readStatus, type;
  var groupName = nodeData._to.group ? groups.find(group => group._id === nodeData._to.group).title : null;

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
        groupName: groupName,
        author: authorName,
        date: date,
        kfId: nodeData.to,
        linkId: nodeData._id,
        type: type
      },
      classes: [readStatus, viewSettings.nodeClass],
      position: {
        x: nodeData.data.x,
        y: nodeData.data.y
      }
  };
}


// handles adding attachments to the cytoscape instance
function handleAttachment(server, token, nodes, nodeData, authorData, viewSettings, groups){

  var authorName = matchAuthorId(nodeData._to.authors[0], authorData);
  var date = parseDate(nodeData.created);
  var groupName = nodeData._to.group ? groups.find(group => group._id === nodeData._to.group).title : null;

  return getApiObjectsObjectId(token, server, nodeData.to).then(function(result){
    if(String(result.data.type).substring(0,5) === "image"){
      var imageUrl =  (server + String(result.data.url).substring(1,)).replace(/\s/g,"%20");

      if(String(result.data.type).slice(-3) === "gif"){
        imageUrl = imageUrl.substring(0, imageUrl.length - 3) + "mp4";
      }

      var bounds = {
        x: nodeData.data ? nodeData.data.x : 0,
        y: nodeData.data ? nodeData.data.y : 0,
        width: nodeData.data ? nodeData.data.width : 0,
        height: nodeData.data ? nodeData.data.height : 0,
      };

      return {
        url: imageUrl,
        name: nodeData._to.title,
        bounds: bounds,
        locked: false,
        linkId: nodeData._id,
        author: authorName,
        kfId: nodeData.to,
        type: nodeData._to.type,
      };

    } else {
      var id = createCytoscapeId(nodes, nodeData.to);
      return {
        group: 'nodes',
        data: {
          id: id,
          name: nodeData._to.title,
          groupName: groupName,
          author: authorName,
          date: date,
          kfId: nodeData.to,
          linkId: nodeData._id,
          type: nodeData._to.type,
          download: server + result.data.url.substring(1,)
        },
        classes: ["attachment", viewSettings.nodeClass],
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
  var authorName = matchAuthorId(nodeData._to.authors[0], authorData);

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
      x: nodeData.data ? nodeData.data.x : 0,
      y: nodeData.data ? nodeData.data.y : 0,
      height: nodeData.data ? node_height : 0,
      width: nodeData.data ? parseInt(nodeData.data.width) : 0,
    };

    return {
      url: 'data:image/svg+xml;utf8,' + encodeURIComponent('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>' + result.data.svg),
      name: nodeData._to.title,
      bounds: bounds,
      locked: false,
      author: authorName,
      kfId: nodeData.to,
      type: nodeData._to.type,
      linkId: nodeData._id
    };

  });
}


// handles adding a link to another view
function handleView(nodes, nodeData, authorData){
  var id = createCytoscapeId(nodes, nodeData.to);
  var authorName = matchAuthorId(nodeData._to.authors[0], authorData);
  return {
    group: 'nodes',
    data: {
      id: id,
      author: authorName,
      name: nodeData._to.title,
      kfId: nodeData.to,
      linkId: nodeData._id,
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
export function matchAuthorId(authorId, authorsInfo){
    for(let i in authorsInfo){
      if(authorId === authorsInfo[i]._id){
        return authorsInfo[i].firstName + " " + authorsInfo[i].lastName;
      }
    }
    return "Author not found";
}


// helper function to return formatted creation date of a note
export function parseDate(date){
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
