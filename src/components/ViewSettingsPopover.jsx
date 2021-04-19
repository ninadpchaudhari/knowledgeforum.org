import React, { Component } from 'react'
import { Row, Col, OverlayTrigger, Popover, Button } from 'react-bootstrap';
//import { Input } from 'reactstrap'
import { connect } from 'react-redux'
import $ from 'jquery';
import { putObject } from '../store/api.js';
import { setCurrViewSettingsObj } from '../store/globalsReducer.js';

class ViewSettingsPopover extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewSettingsObj: (this.props.thisViewsViewSettingsObj !== null) ? (this.props.thisViewsViewSettingsObj) :
                            (this.props.communityViewSettingsObj !== null ? this.props.communityViewSettingsObj : {buildson: true, language: false, references: false, showAuthor: true, showGroup: false, showTime: true}),
      communityViewSettingsObj: (this.props.thisViewsViewSettingsObj !== null) ? (this.props.thisViewsViewSettingsObj) :
                            (this.props.communityViewSettingsObj !== null ? this.props.communityViewSettingsObj : {buildson: true, language: false, references: false, showAuthor: true, showGroup: false, showTime: true}),
    }

    this.initializeSettings = this.initializeSettings.bind(this);
    this.handleViewTypeChange = this.handleViewTypeChange.bind(this);
    this.handleViewSettingsChange = this.handleViewSettingsChange.bind(this);
    this.handleCommunitySettingsChange = this.handleCommunitySettingsChange.bind(this);
    this.compareViewSettingsObjs = this.compareViewSettingsObjs.bind(this);
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.thisViewsViewSettingObj !== prevProps.thisViewsViewSettingObj || this.props.communityViewSettingsObj !== prevProps.communityViewSettingsObj){
      this.initializeSettings();
    }
  }

  // used to reset the viewSettingsObj and communityViewSettingsObj state
  // viewSettingsObj corresponds to the temp view settings and is always initiliazed to be the same as the community view settings
  // communityViewSettingsObj is set to these values in this priority
  // 1. The view objects viewSetting object if it exists
  // 2. The community context objects viewSetting object if it exists
  // 3. A default value of {buildson: true, language: false, references: false, showAuthor: true, showGroup: false, showTime: true}
  initializeSettings(){
    var temp = {}
    if(this.props.thisViewsViewSettingObj !== null){
      temp = this.props.thisViewsViewSettingsObj;
    } else if(this.props.communityViewSettingsObj !== null){
      temp = this.props.communityViewSettingsObj;
    } else {
      temp = {buildson: true, language: false, references: false, showAuthor: true, showGroup: false, showTime: true}
    }

    this.setState({viewSettingsObj: temp, communityViewSettingsObj: temp});
    this.props.setCurrViewSettingsObj(temp);
  }

  handleViewTypeChange(e){
    if(e.target.value !== this.props.currentView) this.props.switchView();
  }

  // handles updating the viewSettingsObj according to the checked values in the popover on the sidebar
  handleViewSettingsChange(e){
    var viewSettingsObj = {};
    const domElem = e.target.parentNode;
    const siblings = $(domElem).siblings();
    viewSettingsObj[e.target.name] = e.target.checked;
    for(let i = 0; i < siblings.length; i++){
      viewSettingsObj[siblings[i].childNodes[1].name] = siblings[i].childNodes[1].checked;
    }
    this.setState({viewSettingsObj: viewSettingsObj});
    this.props.setCurrViewSettingsObj(viewSettingsObj);
  }

  handleCommunitySettingsChange(e){
    console.log(this.compareViewSettingsObjs(this.state.communityViewSettingsObj, this.props.thisViewsViewSettingsObj));
    console.log(this.compareViewSettingsObjs(this.state.communityViewSettingsObj, this.props.communityViewSettingsObj));

    // var communityViewSettingsObj = {};
    // const domElem = e.target.parentNode;
    // const siblings = $(domElem).siblings();
    // communityViewSettingsObj[e.target.name] = e.target.checked;
    // for(let i = 0; i < siblings.length; i++){
    //   communityViewSettingsObj[siblings[i].childNodes[1].name] = siblings[i].childNodes[1].checked;
    // }
    //
    // this.setState({communityViewSettingsObj: communityViewSettingsObj});
  }

  // returns a deep comparison of two viewSetting objects
  compareViewSettingsObjs(a, b){
    if(a === null || b === null) return false;

    return a.buildson === b.buildson && a.language === b.language && a.references === b.references
                && a.showAuthor === b.showAuthor && a.showGroup === b.showGroup && a.showTime === b.showTime;
  }

  render() {
    return (
      <OverlayTrigger
          placement="auto"
          trigger="click"
          delay={{ show: 0, hide: 0 }}
          rootClose
          overlay={
            <Popover>
              <Popover.Title>View Type</Popover.Title>
              <Popover.Content id="viewTypeContent">
                <Row>
                  <Col><Button value="Enhanced" onClick={this.handleViewTypeChange} className={this.props.currentView==="Enhanced" ? 'activeView' : ''}>Enhanced</Button></Col>
                  <Col><Button value="Light" onClick={this.handleViewTypeChange} className={this.props.currentView==="Light" ? 'activeView' : ''}>Light</Button></Col>
                </Row>
              </Popover.Content>
              <Popover.Title>View Settings (Temporary)<a id="viewSettingsReset" onClick={this.initializeSettings}><i className="fas fa-undo-alt"></i></a></Popover.Title>
              <Popover.Content>
                <ul id="viewSettingsPopoverList">
                  <li>Buildson <input type="checkbox" name="buildson" onChange={this.handleViewSettingsChange} checked={this.state.viewSettingsObj.buildson}></input></li>
                  <li>Reference <input type="checkbox" name="references" onChange={this.handleViewSettingsChange} checked={this.state.viewSettingsObj.references}></input></li>
                  <li>Group <input type="checkbox" name="showGroup" onChange={this.handleViewSettingsChange} checked={this.state.viewSettingsObj.showGroup}></input></li>
                  <li>Author <input type="checkbox" name="showAuthor" onChange={this.handleViewSettingsChange} checked={this.state.viewSettingsObj.showAuthor}></input></li>
                  <li>Date <input type="checkbox" name="showTime" onChange={this.handleViewSettingsChange} checked={this.state.viewSettingsObj.showTime}></input></li>
                </ul>
              </Popover.Content>
              {(this.props.author && this.props.author.role === "manager") ? (
                <Popover.Title>Community Settings</Popover.Title>
              ) : null}
              {(this.props.author && this.props.author.role === "manager") ? (
                <Popover.Content>
                  <ul id="communitySettingsPopoverList">
                    <li>Buildson <input type="checkbox" name="buildson" onChange={this.handleCommunitySettingsChange} checked={this.state.communityViewSettingsObj.buildson}></input></li>
                    <li>Reference <input type="checkbox" name="references" onChange={this.handleCommunitySettingsChange} checked={this.state.communityViewSettingsObj.references}></input></li>
                    <li>Group <input type="checkbox" name="showGroup" onChange={this.handleCommunitySettingsChange} checked={this.state.communityViewSettingsObj.showGroup}></input></li>
                    <li>Author <input type="checkbox" name="showAuthor" onChange={this.handleCommunitySettingsChange} checked={this.state.communityViewSettingsObj.showAuthor}></input></li>
                    <li>Date <input type="checkbox" name="showTime" onChange={this.handleCommunitySettingsChange} checked={this.state.communityViewSettingsObj.showTime}></input></li>
                  </ul>
                </Popover.Content>
              ) : null}
            </Popover>
          }>
          <Button className="circle-button pad sidebar-btn">
              <i className="fas fa-cog"></i>
          </Button>
      </OverlayTrigger>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
    return {
        author: state.globals.author,
        currViewSettingsObj: state.globals.currViewSettingsObj,
        thisViewsViewSettingsObj: state.globals.thisViewsViewSettingsObj,
        communityViewSettingsObj: state.globals.communityViewSettingsObj,
    }
}

const mapDispatchToProps = {
    setCurrViewSettingsObj
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewSettingsPopover);
