import React, {Component} from 'react'
import { connect } from 'react-redux'
import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import CytoscapePanZoom from 'cytoscape-panzoom';
import CytoscapeNodeHtmlLabel from 'cytoscape-node-html-label';
import CytoscapeSupportImages from 'cytoscape-supportimages';

import {getApiLinksFromViewId} from './api/link.js';
import {postApiLinksCommunityIdSearch} from './api/link.js';
import {getApiLinksReadStatus} from './api/link.js';
import {getCommunityAuthors} from './api/community.js';
import {addNodesToGraph} from './helper/Graph_helper.js';
import {addEdgesToGraph} from './helper/Graph_helper.js';
import {postReadStatus} from './store/api.js'
import { openContribution } from './store/noteReducer.js'
import { setViewId } from './store/globalsReducer.js'
import './css/cytoscape.js-panzoom.css';
import './css/Graph.css';

import unread_note_icon from './assets/icon_note_blue.png';
import read_note_icon from './assets/icon_note_red.png';
import unread_riseabove_icon from './assets/icon_riseabove_blue.png';
import read_riseabove_icon from './assets/icon_riseabove_red.png';
import attachment_icon from './assets/icon_attachment.gif';
import view_icon from './assets/icon_view.png';

import {MINZOOM, MAXZOOM} from './config.js';

Cytoscape.use(CytoscapePanZoom);
Cytoscape.use(CytoscapeNodeHtmlLabel);
Cytoscape.use(CytoscapeSupportImages);

class Graph extends Component {
  constructor(props) {
      super(props);
      this.state = {
          elements: {nodes: [], edges: []},
      };
      this.loadElements = this.loadElements.bind(this);
      this.componentDidMount = this.componentDidMount.bind(this);
      this.refreshElements = this.refreshElements.bind(this);
  };

  loadElements(cy, si) {
    var promise = getApiLinksFromViewId(this.state.token, this.state.server, this.state.viewId);
    var promise1 = postApiLinksCommunityIdSearch(this.state.token, this.state.server, this.state.communityId, {type: "buildson"});
    var promise2 = getApiLinksReadStatus(this.state.token, this.state.server, this.state.communityId, this.state.viewId);
    var promise3 = getCommunityAuthors(this.state.token, this.state.communityId, this.state.server);
    var ref = this;

    Promise.all([promise, promise1, promise2, promise3]).then((result) => {
        ref.refreshElements(...result)
    });
  }

    refreshElements(viewLinks, buildsons, reads, authors){
        if (this.cy){
            console.log("refresh elements")
            var nodes = new Map();
            var si = this.cy.supportimages();
            // clear the support images extension
            si._private.supportImages = [];
            si._private.renderer.imageCache = {};

            const graph_nodes = addNodesToGraph(this, this.state.token, si, nodes, viewLinks, reads, authors);
            const graph_edges = addEdgesToGraph(nodes, buildsons);

            const self = this;
            Promise.all(graph_nodes.concat(graph_edges)).then((graph_results) => {
                var cy_elements = {nodes: [], edges: []};
                for(let i = 0; i < graph_results.length; i++){
                    if(graph_results[i].group === "nodes"){
                        cy_elements.nodes.push(graph_results[i]);
                    } else if(graph_results[i].group === "edges"){
                        cy_elements.edges.push(graph_results[i]);
                    } else if(graph_results[i].url){
                        si.addSupportImage(graph_results[i]);
                    }
                }

                si.notify({type: 'render'});
                self.setState({elements: cy_elements});
            });
        }
    }

  componentDidMount() {
    var cy = this.cy;

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

    // CYTOSCAPE-NODE-HTML-LABEL EXTENSION
    cy.nodeHtmlLabel([
      {
        query: 'node',
        halign: 'center', // title horizontal position. Can be 'left',''center, 'right'
        valign: 'bottom', // title vertical position. Can be 'top',''center, 'bottom'
        halignBox: 'right', // title relative box horizontal position. Can be 'left',''center, 'right'
        valignBox: 'bottom', // title relative box vertical position. Can be 'top',''center, 'bottom'
        cssClass: 'cytoscape-label', // any classes will be as attribute of <div> container for every title
        tpl: function(data){
          // we only want author and creation date listed for notes
          if(data.type === 'note' || data.type === 'riseabove' || data.type === 'Attachment'){
            return '<div>' + data.author + '<br>' + data.date + '</div>';
          } else {
            return '';
          }
        }
      },
    ]);

    // CYTOSCAPE SUPPORTIMAGES EXTENSION
      /* var si = cy.supportimages(); */

      /* this.loadElements(cy, si); */

    var ref = this;
    // on single click of node log its kf id and mark it as read
    cy.on('tap', 'node', function(event){
      var kfId = this.data('kfId');
      var type = this.data('type');

      if(this.hasClass("image")){
        console.log("image");
      } else if(this.hasClass("attachment")){
        console.log("attachment");
      } else if(this.hasClass("view")){
          ref.setState({viewId: kfId});
          ref.props.setViewId(kfId)
          /* ref.loadElements(cy); */
      } else {
        if(type === "riseabove"){
          this.removeClass("unread-riseabove");
          this.addClass("read-riseabove");
        } else if(type === "note"){
          ref.props.openContribution(kfId,"write")
          this.removeClass("unread-note");
          this.addClass("read-note");
        }
        postReadStatus(ref.props.communityId, kfId);
      }
    });

  }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.viewLinks.length !== prevProps.viewLinks.length ||
            this.props.buildsOn.length !== prevProps.buildsOn.length ||
            this.props.reads.length !== prevProps.reads.length ||
            this.props.authors !== prevProps.authors
        ) {
            /* if (this.props.viewLinks.length !== prevProps.viewLinks.length ){
             *     console.log("view links updated")
             * }else if (
             *     this.props.buildsOn.length !== prevProps.buildsOn.length 
             * ){
             *     console.log("buildson updated")
             * }else if (this.props.reads.length !== prevProps.reads.length){
             *     console.log("reads updated")
             * }else{
             *     console.log("authors updated")
             * } */
            if(this.props.reads.length > 0){
                this.refreshElements(this.props.viewLinks, this.props.buildsOn, this.props.reads, Object.values(this.props.authors));
            }
        }

    }

  render() {

    return(
           <CytoscapeComponent
          cy={(cy) => { this.cy = cy }}
          style={ { width: '100%', height: '100vh' } }
               elements={CytoscapeComponent.normalizeElements(this.state.elements)}
          stylesheet={ [
            {
              selector: 'node',
              style: {
                'label': "data(name)",
                'font-size': '11px',
                'text-halign': 'right',
                'text-valign': 'center',
                'text-margin-x': '-5',
                'padding': '0',
                'background-opacity': '0',
                'background-clip': 'none',
                'background-width': '15px',
                'background-height': '15px'
              }
            },
            {
              selector: 'edge',
              style: {
                'width': 1,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier'
              }
            },

            {selector: '.unread-note', style: {'background-image': [unread_note_icon]}},
            {selector: '.read-note', style: {'background-image': [read_note_icon]}},
            {selector: '.unread-riseabove', style: {'background-image': [unread_riseabove_icon]}},
            {selector: '.read-riseabove', style: {'background-image': [read_riseabove_icon]}},
            {selector: '.attachment', style: {'background-image': [attachment_icon]}},
            {selector: '.view', style: {'background-image': [view_icon]}},
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
          ] }
          layout={ {name: 'grid'} }
          hideEdgesonViewport={ false }
          autolock={ false }
          wheelSensitivity={ 0.15 }
          minZoom={ MINZOOM }
          maxZoom={ MAXZOOM }
          />
          );
  }
}

const mapStateToProps = (state, ownProps) => {
    return {
        author: state.globals.author,
        authors: state.users,
        viewLinks: state.notes.viewLinks,
        buildsOn: state.notes.buildsOn,
        reads: state.notes.readLinks,
        viewId: state.globals.viewId,
        communityId: state.globals.communityId
    }
}

const mapDispatchToProps = {
    setViewId,
    openContribution,
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Graph)
