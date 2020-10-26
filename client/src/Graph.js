import React, {Component} from 'react'
import Cytoscape from 'cytoscape';
import CytoscapePanZoom from 'cytoscape-panzoom';
import CytoscapeComponent from 'react-cytoscapejs';

Cytoscape.use(CytoscapePanZoom);

class Graph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      server: null,
      communityId: null,
      viewId: null,
      nodeData: null,
      edgeData: null,
      readStatusData: null,
      authorData: null
    };
  };

  // CYTOSCAPE-PANZOOM EXTENSION
  // the default values of each option are outlined below:
  var defaults = {
    zoomFactor: 0.05, // zoom factor per zoom tick
    zoomDelay: 45, // how many ms between zoom ticks
    minZoom: 0.75, // min zoom level
    maxZoom: 2, // max zoom level
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

  const elements = [
   { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
   { data: { id: 'two', label: 'Node 2' }, position: { x: 100, y: 0 } },
   { data: { source: 'one', target: 'two', label: 'Edge from Node1 to Node2' } }
  ];

  render() {
    return <CytoscapeComponent cy={(cy) => { this.cy = cy }} elements={elements} style={ { width: '600px', height: '600px' } } />;
  }
}

export default Graph
