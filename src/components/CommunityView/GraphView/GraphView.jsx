import React, {Component} from 'react'
import { connect } from 'react-redux'
import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import CytoscapePanZoom from 'cytoscape-panzoom';
import CytoscapeNodeHtmlLabel from 'cytoscape-node-html-label';
import CytoscapeSupportImages from 'cytoscape-supportimages';
import CytoscapeContextMenus from 'cytoscape-context-menus';
import CytoscapeSpread from 'cytoscape-spread';

import { updateViewLink } from '../../../store/async_actions.js'
import { addNotification } from '../../../store/notifier.js'
import {addNodesToGraph, addEdgesToGraph } from './GraphView_helper.js';
import './cytoscape.js-panzoom.css';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
import './GraphView.css';


import unread_note_icon from '../../../assets/icon_note_blue.png';
import read_note_icon from '../../../assets/icon_note_red.png';
import unread_riseabove_icon from '../../../assets/icon_riseabove_blue.png';
import read_riseabove_icon from '../../../assets/icon_riseabove_red.png';
import attachment_icon from '../../../assets/icon_attachment.gif';
import view_icon from '../../../assets/icon_view.png';
import {MIN_ZOOMED_FONT_SIZE, MINZOOM, MAXZOOM} from '../../../config.js';

Cytoscape.use(CytoscapePanZoom);
Cytoscape.use(CytoscapeNodeHtmlLabel);
Cytoscape.use(CytoscapeSupportImages);
Cytoscape.use(CytoscapeContextMenus);
Cytoscape.use(CytoscapeSpread);

class GraphView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      elements: {nodes: [], edges: []},
      kfToCyMap: null,
      removedSearchElements: null,
      removedBoxSelectElements: null,
      removedEdgeElements: null,
      currViewLinksLength: 0,
    };

    this.loadElements = this.loadElements.bind(this);
    this.supportImageIsDuplicate = this.supportImageIsDuplicate.bind(this);
    this.compareSupportImages = this.compareSupportImages.bind(this);
    this.findCyIdsFromKfId = this.findCyIdsFromKfId.bind(this);
    this.updateReadLinks = this.updateReadLinks.bind(this);
    this.focusRecentAddition = this.focusRecentAddition.bind(this);
    this.filterNodes = this.filterNodes.bind(this);
    this.handleNodeOpen = this.handleNodeOpen.bind(this);
    this.getViewSettingsInfo = this.getViewSettingsInfo.bind(this);
    this.updateViewSettings = this.updateViewSettings.bind(this);
    this.runLayout = this.runLayout.bind(this);
  };

  loadElements(prevViewLinksLength, forceRender) {
      // ensure we have all the informationn needed to render the graph
      // if ((VIEWLINKS UPDATED OR FORCE RENDER FROM EDGE CASE) AND WE HAVE BUILDSON + AUTHORS INFO)
      // only the viewlinks prop changes between views - buildson and author info stays the same
      if ((Object.keys(this.props.viewLinks).length !== this.state.currViewLinksLength || forceRender) && this.props.buildsOn.length !== 0
                                          && this.props.references !== undefined && Object.keys(this.props.authors).length !== 0){
          this.setState({currViewLinksLength: Object.keys(this.props.viewLinks).length});
          const cy = this.cy;
          const si = cy.supportimages();

          // we keep a map with (key, value) of (kfId, count) in order to create duplicate notes with unique ids
          // simply append the count to the end of their note id
          var nodes = new Map();

          // clear the support images extension
          si._private.supportImages = [];

          var viewSettings = this.getViewSettingsInfo();
          var groups = this.props.community ? this.props.community.groups : [];

          var graph_nodes = addNodesToGraph(this.props.server, this.props.token, nodes, Object.values(this.props.viewLinks), this.props.authors, viewSettings, groups);
          var graph_edges = addEdgesToGraph(nodes, this.props.buildsOn, this.props.references, viewSettings);
          var self = this;

          Promise.all(graph_nodes.concat(graph_edges)).then((graph_results) => {
              var cy_elements = {nodes: [], edges: []};
              var initialRemovedEdgeElements = {edges: []};
              for(let i = 0; i < graph_results.length; i++){
                  if(graph_results[i].group === "nodes"){
                      cy_elements.nodes.push(graph_results[i]);
                  } else if(graph_results[i].group === "edges" && graph_results[i].initialDisplay === true){
                      cy_elements.edges.push(graph_results[i]);
                  } else if(graph_results[i].group === "edges" && graph_results[i].initialDisplay === false){
                      initialRemovedEdgeElements.edges.push(graph_results[i]);
                  } else if(graph_results[i].url && !this.supportImageIsDuplicate(si.images(), graph_results[i])){
                      si.addSupportImage(graph_results[i]);
                  }
              }

              self.setState({
                elements: cy_elements,
                kfToCyMap: nodes,
                removedEdgeElements: initialRemovedEdgeElements
              });
              // support-images extension will not trigger a redraw if there are no images in the view - this line handles that
              if(si.images().length === 0){ si._private.renderer.redraw(); }
              // if a single new element was added to the graph - highlight it
              if(Object.values(this.props.viewLinks).length === prevViewLinksLength + 1){ this.focusRecentAddition(Object.values(this.props.viewLinks)[Object.values(this.props.viewLinks).length - 1]); }
          });
      }
  }

  // checks if the given image a is already present in the list of support images
  supportImageIsDuplicate(imgs, a){
    for(var i in imgs){
      if(this.compareSupportImages(imgs[i], a)) return true;
    }
    return false;
  }

  // returns a deep comparison of two support images
  compareSupportImages(a, b){
    return a.bounds.height === b.bounds.height && a.bounds.width === b.bounds.width && a.bounds.x === b.bounds.x && a.bounds.y === b.bounds.y
        && a.name === b.name && a.url === b.url;
  }

  // returns an array of cytoscapeIds corresponding to the given kfId
  findCyIdsFromKfId(kfId){
    var map = this.state.kfToCyMap;
    if(map.has(kfId)){
      var cytoscapeIds = [];
      var countInstances = map.get(kfId);
      for(let i = 1; i <= countInstances; i++){
        cytoscapeIds.push(kfId+'-'+i);
      }
      return cytoscapeIds;
    }
    return null;
  }

  // all links are initially marked as unread - this function updates the read links accordingly afterward
  updateReadLinks(){
    var cy = this.cy;
    var readLinks = this.props.readLinks;
    var self = this;

    if(this.state.kfToCyMap !== null){
      // cy.batch() updates all the elements one time instead of triggering multiple redraws
      cy.batch(function(){
        for(let i in readLinks){
          var cy_elems = self.findCyIdsFromKfId(readLinks[i]); // the element will either be a riseabove or a regular note
          if(cy_elems !== null && cy_elems.length !== 0){
            var isRiseAbove = cy.$('#'+cy_elems[0]).hasClass('unread-riseabove') ? true : false;
            var classToRemove = isRiseAbove ? 'unread-riseabove' : 'unread-note';
            var classToAdd = isRiseAbove ? 'read-riseabove' : 'read-note';
            for(let i in cy_elems){
              cy.$('#'+cy_elems[i]).removeClass(classToRemove).addClass(classToAdd);
            }
          }
        }
      });
    }
  }

  focusRecentAddition(note){
    var cy = this.cy;
    var kfId = note.to;
    var cyIds = this.findCyIdsFromKfId(kfId);
    if(cyIds !== null){
      var newestCyElem = cy.$('#'+cyIds[cyIds.length - 1]);
      newestCyElem.addClass('recentAddition');
      newestCyElem.on(['select', 'grabon'], () => {
        newestCyElem.removeClass('recentAddition');
      });
    }
  }

  filterNodes(q){
    var cy = this.cy;
    const si = cy.supportimages();

    if(this.state.removedSearchElements !== null) this.state.removedSearchElements.restore();
    this.setState({removedSearchElements: null});
    var imgs = si.images();
    for(let i in imgs){
      si.setImageVisible(imgs[i], true);
    }

    var nodesToHide = cy.collection();
    const query = q || this.props.searchQuery;
    const notes = Object.values(this.props.viewNotes);
    var filter = this.props.searchFilter;
    var self = this;
    switch (filter) {
        case "title":
            // eslint-disable-next-line
            nodesToHide = cy.filter(function(elem, i){
               const elem_type = elem.data('type');
               const elem_title = elem.data('name');
               if((elem_type === "note" || elem_type === "View" || elem_type === "riseabove" || elem_type === "Attachment") && !elem_title.toLowerCase().includes(query.toLowerCase())){
                 return elem;
               }
            });

            // for(let i in imgs){
            //   var supportImg = imgs[i];
            //   if(!supportImg.name.toLowerCase().includes(query.toLowerCase())){
            //     si.setImageVisible(supportImg, false);
            //   }
            // }

            break;

        case "content":
            // eslint-disable-next-line
            notes.filter(function (obj) {
                if (obj.data && ( (obj.data.English && !obj.data.English.includes(query)) || (obj.data.body && !obj.data.body.includes(query)) ) ) {
                  var cy_ids = self.findCyIdsFromKfId(obj._id);
                  for(let j in cy_ids){ nodesToHide = nodesToHide.union(cy.$('#'+cy_ids[j])); }
                }
            });

            break;

        case "author":
            // eslint-disable-next-line
            nodesToHide = cy.filter(function(elem, i){
               const elem_type = elem.data('type');
               const elem_author = elem.data('author');
               if((elem_type === "note" || elem_type === "View" || elem_type === "riseabove" || elem_type === "Attachment") && !elem_author.toLowerCase().includes(query.toLowerCase())){
                 return elem;
               }
            });

            // for(let i in imgs){
            //   var supportImg = imgs[i];
            //   if(!supportImg.author.toLowerCase().includes(query.toLowerCase())){
            //     si.setImageVisible(supportImg, false);
            //   }
            // }

            break;

        case "scaffold":
            const noteIds = this.props.supports.filter(support => support.from === query).map(support => support.to);
            // eslint-disable-next-line
            notes.filter(function(note){
              if(!noteIds.includes(note._id)){
                var cy_ids = self.findCyIdsFromKfId(note._id);
                for(let j in cy_ids){ nodesToHide = nodesToHide.union(cy.$('#'+cy_ids[j])); }
              }
            });
            break;

        case "time":
            var curr_date = new Date();
            // eslint-disable-next-line
            nodesToHide = cy.filter(function(elem, i){
               const elem_date = new Date(elem.data('date'));
               if(elem.data('date') !== undefined && elem_date !== "Invalid Date"){
                 var diff = curr_date - elem_date;
                 var secondsDiff = diff/1000;

                 if(query === "today" && !(secondsDiff <= 86400)){ return elem; }
                 else if(query === "week" && !(secondsDiff <= 604800)){ return elem; }
                 else if(query === "month" && !(secondsDiff <= 2592000)){ return elem; }
                 else if(query === "year" && !(secondsDiff <= 31556952)){ return elem; }
               }
            });
            break;

        default:
            break;
    }

    if(nodesToHide.length !== 0){
      var removedSearchElements = cy.remove(nodesToHide);
      this.setState({removedSearchElements: removedSearchElements});
    }
  }

  handleNodeOpen(evt){
    var cy_node = evt.target;
    var kfId = cy_node.data('kfId');
    var type = cy_node.data('type');

    if(!cy_node.data('canOpen')){
      addNotification({ title: 'Cannot open contribution: "' + cy_node.data('name') + '"', type: 'default', message: '"' + cy_node.data('name') + '" is locked.' })
    } else if(cy_node.hasClass("attachment") || type === "riseabove" || type === "note") {
      this.props.onNoteClick(kfId);
      if(type === "riseabove"){ cy_node.addClass('read-riseabove').removeClass('unread-riseabove'); }
      if(type === "note"){ cy_node.addClass('read-note').removeClass('unread-note'); }
    } else if(cy_node.hasClass('view')) {
      this.props.onViewClick(kfId);
    }
  }

  // formats the view settings to be used in cytoscape
  getViewSettingsInfo(){
    var viewSettings = this.props.currViewSettingsObj;
    var result = {};
    if(viewSettings.showGroup && viewSettings.showAuthor && viewSettings.showTime){ result.nodeClass = 'nodehtmllabel-group-author-date'; }
    else if(viewSettings.showGroup && viewSettings.showAuthor && !viewSettings.showTime){ result.nodeClass = 'nodehtmllabel-group-author-nodate'; }
    else if(viewSettings.showGroup && !viewSettings.showAuthor && viewSettings.showTime){ result.nodeClass = 'nodehtmllabel-group-noauthor-date'; }
    else if(viewSettings.showGroup && !viewSettings.showAuthor && !viewSettings.showTime) { result.nodeClass = 'nodehtmllabel-group-noauthor-nodate'; }
    else if(!viewSettings.showGroup && viewSettings.showAuthor && viewSettings.showTime) { result.nodeClass = 'nodehtmllabel-nogroup-author-date'; }
    else if(!viewSettings.showGroup && viewSettings.showAuthor && !viewSettings.showTime) { result.nodeClass = 'nodehtmllabel-nogroup-author-nodate'; }
    else if(!viewSettings.showGroup && !viewSettings.showAuthor && viewSettings.showTime) { result.nodeClass = 'nodehtmllabel-nogroup-noauthor-date'; }
    else if(!viewSettings.showGroup && !viewSettings.showAuthor && !viewSettings.showTime) { result.nodeClass = 'nodehtmllabel-nogroup-noauthor-nodate'; }

    result.buildson = viewSettings.buildson;
    result.references = viewSettings.references;
    return result;
  }

  // batch updates the nodes and edges corresponding to the view settings
  updateViewSettings(){
    var cy = this.cy;

    if(this.state.removedEdgeElements !== null && this.state.removedEdgeElements.edges) cy.add(this.state.removedEdgeElements);
    else if(this.state.removedEdgeElements !== null) this.state.removedEdgeElements.restore();
    this.setState({removedEdgeElements: null});

    var nodes = cy.nodes();
    var edges = cy.edges();
    var newInfo = this.getViewSettingsInfo();
    var self = this;
    cy.batch(function(){

      if(nodes.length !== 0){
        // iterate cytoscape nodes
        for(let i in nodes){
          if(nodes[i][0] && nodes[i][0].classes()){

            // iterate the nodes classes to see if it has a class with prefix 'nodehtmllabel'
            // if it does replace it with the nodeClass in the newInfo object
            var classes = nodes[i][0].classes();
            for(let j in classes){
              if(classes[j].substring(0,13) === 'nodehtmllabel' && classes[j] !== newInfo.nodeClass){
                nodes[i].removeClass(classes[j]).addClass(newInfo.nodeClass);
              }
            }
          }
        }
      }

      if(edges.length !== 0){
        var edgesToHide = cy.collection();
        // iterate cytoscape edges
        for(let i in edges){
          // if the edge is a buildson and buildson are hidden OR if the edge is a reference and references are hidden - add it to the collection of edges to be removed
          if(edges[i][0] && ((edges[i][0].hasClass('buildson') && newInfo.buildson === false) || ((edges[i][0].hasClass('references') && newInfo.references === false)))){
            edgesToHide = edgesToHide.union(edges[i][0]);
          }
        }

        if(edgesToHide.length !== 0){
          var removedEdgeElements = cy.remove(edgesToHide);
          self.setState({removedEdgeElements: removedEdgeElements});
        }
      }
    });

  }

  // helper function for handling running different types of layouts
  runLayout(layoutType){
    var cy = this.cy;
    // for preset we just reset the state and rerender the entire graph
    if(layoutType === "preset"){
      this.setState({
        elements: {nodes: [], edges: []},
        removedSearchElements: null,
        removedBoxSelectElements: null,
        removedEdgeElements: null,
      });
      this.loadElements(Object.keys(this.props.viewLinks).length, true);
      cy.reset();
    } else {
      // for spread layout we specify some parameters for running it
      // otherwise we just run layouts as default
      var layout = (layoutType === "spread") ? ({
        name: layoutType,
        animate: false,
        prelayout: false,
      })
      : {name: layoutType};
      cy.layout(layout).run();
    }
  }

  componentDidMount() {
    var cy = this.cy;
    var ref = this;

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

    // CYTOSCAPE CONTEXT MENU EXTENSION
    var options = {
        evtType: ['cxttap', 'cysupportimages.imageselected'],
        menuItems: [
          {
            id: 'open',
            content: 'Open',
            selector: 'node',
            onClickFunction: function (evt) {
              ref.handleNodeOpen(evt)
            },
            disabled: false,
            coreAsWell: false,
          },
          {
            id: 'new-note',
            content: 'New Note Here',
            selector: '',
            coreAsWell: true,
            onClickFunction: function (evt) {
              console.log('new note');
            }
          }
        ],
    };

    cy.contextMenus(options);

    // CYTOSCAPE-NODE-HTML-LABEL EXTENSION
    cy.nodeHtmlLabel([
      {
        query: '.nodehtmllabel-group-author-date',
        halign: 'center', // title horizontal position. Can be 'left',''center, 'right'
        valign: 'bottom', // title vertical position. Can be 'top',''center, 'bottom'
        halignBox: 'right', // title relative box horizontal position. Can be 'left',''center, 'right'
        valignBox: 'bottom', // title relative box vertical position. Can be 'top',''center, 'bottom'
        cssClass: 'cytoscape-label', // any classes will be as attribute of <div> container for every title
        tpl: function(data){
          if(data.type === 'note' || data.type === 'riseabove' || data.type === 'Attachment' || data.type === 'Drawing'){
            return '<div>' + (data.groupName !== null ? data.groupName : data.author) + '<br>' + data.date + '</div>';
          }
        }
      },
      {
        query: '.nodehtmllabel-group-author-nodate',
        halign: 'center',
        valign: 'bottom',
        halignBox: 'right',
        valignBox: 'bottom',
        cssClass: 'cytoscape-label',
        tpl: function(data){
          if(data.type === 'note' || data.type === 'riseabove' || data.type === 'Attachment' || data.type === 'Drawing'){
            return '<div>' + (data.groupName !== null ? data.groupName : data.author) + '</div>';
          }
        }
      },
      {
        query: '.nodehtmllabel-group-noauthor-date',
        halign: 'center',
        valign: 'bottom',
        halignBox: 'right',
        valignBox: 'bottom',
        cssClass: 'cytoscape-label',
        tpl: function(data){
          if(data.type === 'note' || data.type === 'riseabove' || data.type === 'Attachment' || data.type === 'Drawing'){
            return (data.groupName !== null) ? ('<div>' + data.groupName + '<br>' + data.date + '</div>') : ('<div>' + data.date + '</div>');
          }
        }
      },
      {
        query: '.nodehtmllabel-group-noauthor-nodate',
        halign: 'center',
        valign: 'bottom',
        halignBox: 'right',
        valignBox: 'bottom',
        cssClass: 'cytoscape-label',
        tpl: function(data){
          if(data.type === 'note' || data.type === 'riseabove' || data.type === 'Attachment' || data.type === 'Drawing'){
            return '<div>' + (data.groupName !== null ? data.groupName : '') + '</div>';
          }
        }
      },
      {
        query: '.nodehtmllabel-nogroup-author-date',
        halign: 'center',
        valign: 'bottom',
        halignBox: 'right',
        valignBox: 'bottom',
        cssClass: 'cytoscape-label',
        tpl: function(data){
          if(data.type === 'note' || data.type === 'riseabove' || data.type === 'Attachment' || data.type === 'Drawing'){
            return '<div>' + data.author + '<br>' + data.date + '</div>';
          }
        }
      },
      {
        query: '.nodehtmllabel-nogroup-author-nodate',
        halign: 'center',
        valign: 'bottom',
        halignBox: 'right',
        valignBox: 'bottom',
        cssClass: 'cytoscape-label',
        tpl: function(data){
          if(data.type === 'note' || data.type === 'riseabove' || data.type === 'Attachment' || data.type === 'Drawing'){
            return '<div>' + data.author + '</div>';
          }
        }
      },
      {
        query: '.nodehtmllabel-nogroup-noauthor-date',
        halign: 'center',
        valign: 'bottom',
        halignBox: 'right',
        valignBox: 'bottom',
        cssClass: 'cytoscape-label',
        tpl: function(data){
          if(data.type === 'note' || data.type === 'riseabove' || data.type === 'Attachment' || data.type === 'Drawing'){
            return '<div>' + data.date + '</div>';
          }
        }
      },
    ]);

    this.loadElements();

    // open contribution on tap of its node
    cy.on('tap', 'node', function(evt){
      ref.handleNodeOpen(evt);
    });

    // when a node is selected in a box select add styling to reflect that +
    // remove the unselected nodes
    cy.on('boxselect', 'node', (evt) => {
      var cy_node = evt.target;
      cy_node.addClass('selected')
      var nodesToHide = cy.remove(cy.elements("node:unselected"));
      ref.setState({removedBoxSelectElements: nodesToHide});
    });

    // run the spread layout for visibility + notify user how to restore the graph
    // when a box selection is finished
    cy.on('boxend', (evt) => {
      addNotification({
        title: 'Layout Tooltip',
        type: 'default',
        message: 'Use the "Original" layout on the sidebar button to restore the graph to its initial state.',
        dismiss: {duration: 5000}
      })
      if(ref.props.layout !== "spread") ref.props.updateParentLayoutProp({target: {value: "spread"}});
      else{ ref.runLayout("spread"); }
    });

    // remove styling from boxselect on unselect +
    // restore the removed nodes and layout
    cy.on('unselect', 'node', (evt) => {
      var cy_node = evt.target;
      cy_node.removeClass('selected');
    });

    // update view link position if node is moved
    cy.on('dragfree', 'node', (evt) => {
        const {x, y} = evt.target.position();

        var kfId = evt.target.data().kfId;

        let viewLink = Object.values(this.props.viewLinks).filter((link) => link.to === kfId)
        if (viewLink !== undefined && viewLink.length) {
            viewLink = viewLink[0];
            const data = {x, y}
            const newViewLink = { ...viewLink }
            newViewLink.data = { ...newViewLink.data, ...data };
            this.props.updateViewLink(newViewLink)
        }
    })

    // open image contribution when it is selected
    cy.on('cysupportimages.imageselected', (evt, img) => {
      // wait 100ms to see if it is just being moved
      // if it is we do not open the contribution
      window.setTimeout(function(){
        if(!img._private.dragging){ ref.props.onNoteClick(img.kfId); }
      }, 100);
    })

    //Update view link position of image if moved
    cy.on('cysupportimages.imagemoved', (evt, img) => {
        let viewLink = this.props.viewLinks[img.linkId]
        if (viewLink !== undefined) {
            const data = {x: img.bounds.x, y: img.bounds.y}
            const newViewLink = { ...viewLink }
            newViewLink.data = { ...newViewLink.data, ...data };
            this.props.updateViewLink(newViewLink)
        }
    })

    //Update view link of image if resized
    cy.on('cysupportimages.imageresized', (evt, img, b1, b2) => {
        let viewLink = this.props.viewLinks[img.linkId]
        if (viewLink !== undefined) {
            const data = {width: img.bounds.width, height: img.bounds.height}
            const newViewLink = { ...viewLink }
            newViewLink.data = { ...newViewLink.data, ...data };
            this.props.updateViewLink(newViewLink)
        }
    })
  }

  componentDidUpdate(prevProps, prevState) {
      // AN OBJECT MAPPING DIFFERENT CASES TO BOOLEAN VALUES
      // this is an attempt to organize and account for all the edge cases when the component updates
      let cases = {

        anyPropUpdated: (this.props.viewId !== prevProps.viewId || this.props.buildsOn !== prevProps.buildsOn || this.props.references !== prevProps.references
                            || this.props.authors !== prevProps.authors || this.props.viewLinks !== prevProps.viewLinks || this.props.community !== prevProps.community),

        currViewLinkUpdated: (this.props.viewId === prevProps.viewId && this.props.buildsOn === prevProps.buildsOn && this.props.references === prevProps.references && this.props.authors === prevProps.authors
                            && this.props.viewLinks !== prevProps.viewLinks && Object.keys(this.props.viewLinks).length === Object.keys(prevProps.viewLinks).length && this.props.readLinks === prevProps.readLinks),

        switchedToEmptyView: (this.props.viewId !== prevProps.viewId && this.props.buildsOn === prevProps.buildsOn && this.props.references === prevProps.references && this.props.authors === prevProps.authors
                            && this.props.viewLinks !== prevProps.viewLinks && Object.keys(this.props.viewLinks).length === 0 && Object.keys(prevProps.viewLinks).length !== undefined),

        searchTriggered: (this.props.searchQuery !== prevProps.searchQuery || this.props.searchFilter !== prevProps.searchFilter),

        updateReadLinks: (this.props.readLinks.length !== 0 && Object.keys(this.props.viewLinks) !== 0 && this.state.kfToCyMap !== prevState.kfToCyMap),

        viewSettingsChanged: (this.props.currViewSettingsObj !== prevProps.currViewSettingsObj),

        layoutChanged: (this.props.layout !== prevProps.layout),

      }

      var forceRender = (cases.switchedToEmptyView || cases.currViewLinkUpdated);

      if(cases.layoutChanged){ this.runLayout(this.props.layout); }
      if(cases.searchTriggered){ this.filterNodes(); }
      if(cases.viewSettingsChanged){ this.updateViewSettings(); }
      if(cases.updateReadLinks){ this.updateReadLinks(); }
      if(cases.anyPropUpdated){ this.loadElements(Object.keys(prevProps.viewLinks).length, forceRender); }
  }

  render() {
    return(
          <CytoscapeComponent
          cy={(cy) => { this.cy = cy }}
          style={ { width: '100%', height: '100%' } }
          elements={CytoscapeComponent.normalizeElements(this.state.elements)}
          stylesheet={ [
            {
              selector: 'node',
              style: {
                'label': "data(name)",
                'min-zoomed-font-size': MIN_ZOOMED_FONT_SIZE,
                'font-size': '11px',
                'text-halign': 'right',
                'text-valign': 'center',
                'text-margin-x': '-5',
                'padding': '0',
                'background-opacity': '0',
                'background-clip': 'none',
                'background-repeat': 'no-repeat',
                'background-width': '15px',
                'background-height': '15px',
                'shape': 'round-rectangle',
              }
            },
            {
              selector: 'edge',
              style: {
                'width': 1,
                'line-color': '#29648f',
                'target-arrow-color': '#29648f',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier'
              }
            },
            {selector: '.buildson', style: {'line-color': '#29648f', 'target-arrow-color': '#29648f'}},
            {selector: '.references', style: {'line-color': 'black', 'target-arrow-color': 'black'}},
            {selector: '.unread-note', style: {'background-image': [unread_note_icon]}},
            {selector: '.read-note', style: {'background-image': [read_note_icon]}},
            {selector: '.unread-riseabove', style: {'background-image': [unread_riseabove_icon]}},
            {selector: '.read-riseabove', style: {'background-image': [read_riseabove_icon]}},
            {selector: '.attachment', style: {'background-image': [attachment_icon]}},
            {selector: '.view', style: {'background-image': [view_icon]}},
            {selector: '.image', style: {'label': ''}},
            {selector: '.drawing', style: {'label': ''}},
            {
              selector: '.recentAddition',
              style: {
                'border-style': 'solid',
                'border-width': '2',
                'border-color': 'red',
              }
            },
            {
              selector: '.selected',
              style: {
                'background-opacity': '0.25',
                'background-color': 'black'
              }
            }
          ] }
          layout={ {name: 'preset'} }
          hideEdgesonViewport={ true }
          textureOnViewPort={ true }
          autolock={ false }
          selectable={ true }
          wheelSensitivity={ 0.15 }
          minZoom={ MINZOOM }
          maxZoom={ MAXZOOM }
          />
          );
  }
}

const mapStateToProps = (state, ownProps) => {
    return {
        token: state.globals.token,
        server: state.globals.currentServer,
        community: state.globals.community,
        viewId: state.globals.viewId,
        author: state.globals.author,
        authors: state.users,
        viewNotes: state.notes.viewNotes,
        viewLinks: state.notes.viewLinks,
        readLinks: state.notes.readLinks,
        buildsOn: state.notes.buildsOn,
        references: state.notes.references,
        supports: state.notes.supports,
        searchQuery: state.globals.searchQuery,
        searchFilter: state.globals.searchFilter,
        currViewSettingsObj: state.globals.currViewSettingsObj,
    }
}

const mapDispatchToProps = {
    updateViewLink
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GraphView)
