import React, {Component} from 'react'
import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import CytoscapePanZoom from 'cytoscape-panzoom';
import CytoscapeNodeHtmlLabel from 'cytoscape-node-html-label';
//import CytoscapeSupportImages from './manual_modules/cytoscape-supportimages.js';

import './css/cytoscape.js-panzoom.css';

import {MINZOOM, MAXZOOM} from './config.js';

Cytoscape.use(CytoscapePanZoom);
Cytoscape.use(CytoscapeNodeHtmlLabel);
//Cytoscape.use(CytoscapeSupportImages);

class Graph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      server: null,
      communityId: null,
      viewId: null
    };
  };

  componentDidMount(){
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
      // {
      //   query: 'node',
      //   halign: 'center', // title horizontal position. Can be 'left',''center, 'right'
      //   valign: 'bottom', // title vertical position. Can be 'top',''center, 'bottom'
      //   halignBox: 'right', // title relative box horizontal position. Can be 'left',''center, 'right'
      //   valignBox: 'bottom', // title relative box vertical position. Can be 'top',''center, 'bottom'
      //   cssClass: 'cytoscape-label', // any classes will be as attribute of <div> container for every title
      //   tpl: function(data){
      //     // we only want author and creation date listed for notes
      //     if(data.type === 'note' || data.type == 'riseabove' || data.type == 'Attachment'){
      //       return '<div>' + data.author + '<br>' + data.date + '</div>';
      //     } else {
      //       return '';
      //     }
      //   }
      // },
    ]);

  }

  render() {
    return <CytoscapeComponent
      cy={(cy) => { this.cy = cy }}
      style={ { width: '100%', height: '100vh' } }
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
      ] }
      layout={ {name: 'grid'} }
      hideEdgesonViewport={ false }
      autolock={ false }
      wheelSensitivity={ 0.15 }
      minZoom={ MINZOOM }
      maxZoom={ MAXZOOM }
      />;
  }
}

export default Graph