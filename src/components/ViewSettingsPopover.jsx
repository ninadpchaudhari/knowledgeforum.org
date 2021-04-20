import React, { Component } from 'react'
import { Row, Col, OverlayTrigger, Popover, Button } from 'react-bootstrap';
//import { Input } from 'reactstrap'
import { connect } from 'react-redux'
import $ from 'jquery';
import { putObject } from '../store/api.js';
import { setView, setCommunitySettings, setCurrViewSettingsObj } from '../store/globalsReducer.js';

class ViewSettingsPopover extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tempViewSettingObj: {buildson: true, language: false, references: false, showAuthor: true, showGroup: false, showTime: true},
      thisViewsViewSettingObj: {buildson: false, language: false, references: false, showAuthor: false, showGroup: false, showTime: false},
      communityViewSettingsObj: {buildson: false, language: false, references: false, showAuthor: false, showGroup: false, showTime: false}
    }

    this.initializeSettings = this.initializeSettings.bind(this);
    this.handleViewTypeChange = this.handleViewTypeChange.bind(this);
    this.handleViewSettingsChange = this.handleViewSettingsChange.bind(this);
    this.pushViewSettingsChange = this.pushViewSettingsChange.bind(this);
    this.pushCommunitySettingsChange = this.pushCommunitySettingsChange.bind(this);
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.view !== prevProps.view || this.props.communitySettings !== prevProps.communitySettings){
      this.initializeSettings();
    }
  }

  // used to set initial values for each of the viewSettingObj states
  initializeSettings(){
    // assign values for this specific view and the community settings if they exist
    if(this.props.thisViewsViewSettingObj !== null){ this.setState({thisViewsViewSettingObj: this.props.thisViewsViewSettingObj}); }
    if(this.props.communityViewSettingsObj !== null){ this.setState({communityViewSettingsObj: this.props.communityViewSettingsObj}); }

    // set the current view setting values (tempViewSettingObj) to the settings
    // provided in this priority ---> 1. this specific views viewSetting obj 2. the community context viewSetting obj 3. a default set of values
    var temp = {}
    if(this.props.thisViewsViewSettingObj !== null){
      temp = this.props.thisViewsViewSettingObj;
    } else if(this.props.communityViewSettingsObj !== null){
      temp = this.props.communityViewSettingsObj;
    } else {
      temp = {buildson: true, language: false, references: false, showAuthor: true, showGroup: false, showTime: true};
    }
    this.setState({tempViewSettingObj: temp});
    this.props.setCurrViewSettingsObj(temp);
  }

  // if the selected view type is different from the current - swap the view
  handleViewTypeChange(e){
    if(e.target.value !== this.props.currentView) this.props.switchView();
  }

  // a unified function that can update any of the viewSetting states
  handleViewSettingsChange(e){
    // create the new viewSetting object from the target and list siblings
    var viewSettings = {};
    const domElem = e.target.parentNode;
    const siblings = $(domElem).siblings();
    viewSettings[e.target.name] = e.target.checked;
    for(let i = 0; i < siblings.length; i++){
      viewSettings[siblings[i].childNodes[1].name] = siblings[i].childNodes[1].checked;
    }

    // depending on id of the list update the corresponding state
    if(domElem.parentNode.id === "tempSettingsPopoverList"){
      this.setState({tempViewSettingObj: viewSettings});
      this.props.setCurrViewSettingsObj(viewSettings);
    } else if(domElem.parentNode.id === "viewSettingsPopoverList"){
      this.setState({thisViewsViewSettingObj: viewSettings});
    } else if(domElem.parentNode.id === "communitySettingsPopoverList"){
      this.setState({communityViewSettingsObj: viewSettings});
    }
  }

  // updates this specific views settings in redux and on the backend
  pushViewSettingsChange(){
    var newObject = JSON.parse(JSON.stringify(this.props.view));
    newObject.data.viewSetting = Object.assign({}, this.state.thisViewsViewSettingObj);
    this.props.setView(newObject);
    console.log(newObject);
  }

  // updates this communitys context setting object in redux and on the backend
  pushCommunitySettingsChange(){
    var newObject = JSON.parse(JSON.stringify(this.props.communitySettings));
    newObject.data.viewSetting = Object.assign({}, this.state.communityViewSettingsObj);
    this.props.setCommunitySettings(newObject);
    console.log(newObject);
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

              {/* VIEW TYPE SELECTION */}
              <Popover.Title>View Type</Popover.Title>
              <Popover.Content id="viewTypeContent">
                <Row>
                  <Col><Button value="Enhanced" onClick={this.handleViewTypeChange} className={this.props.currentView==="Enhanced" ? 'activeView' : ''}>Enhanced</Button></Col>
                  <Col><Button value="Light" onClick={this.handleViewTypeChange} className={this.props.currentView==="Light" ? 'activeView' : ''}>Light</Button></Col>
                </Row>
              </Popover.Content>
              {/* END VIEW TYPE SELECTION */}

              {/* TEMPORARY VIEW SETTINGS */}
              <Popover.Title>View Settings (Temporary)<a id="viewSettingsReset" onClick={this.initializeSettings}><i className="fas fa-undo-alt"></i></a></Popover.Title>
              <Popover.Content>
                <ul id="tempSettingsPopoverList" className="settingsPopoverList">
                  <li>Buildson <input type="checkbox" name="buildson" onChange={this.handleViewSettingsChange} checked={this.state.tempViewSettingObj.buildson}></input></li>
                  <li>Reference <input type="checkbox" name="references" onChange={this.handleViewSettingsChange} checked={this.state.tempViewSettingObj.references}></input></li>
                  <li>Group <input type="checkbox" name="showGroup" onChange={this.handleViewSettingsChange} checked={this.state.tempViewSettingObj.showGroup}></input></li>
                  <li>Author <input type="checkbox" name="showAuthor" onChange={this.handleViewSettingsChange} checked={this.state.tempViewSettingObj.showAuthor}></input></li>
                  <li>Date <input type="checkbox" name="showTime" onChange={this.handleViewSettingsChange} checked={this.state.tempViewSettingObj.showTime}></input></li>
                </ul>
              </Popover.Content>
              {/* END TEMPORARY VIEW SETTINGS */}

              {/* PERMANENT SETTINGS SPECIFIC TO THIS VIEW */}
              {(this.props.author && this.props.author.role === "manager") ? (
                <Popover.Title>View Settings (Permanent)<a className="saveCommunitySettingsIcon" onClick={this.pushViewSettingsChange}><i className="far fa-save"></i></a></Popover.Title>
              ) : null}
              {(this.props.author && this.props.author.role === "manager") ? (
                <Popover.Content>
                  <ul id="viewSettingsPopoverList" className="settingsPopoverList">
                    <li>Buildson <input type="checkbox" name="buildson" onChange={this.handleViewSettingsChange} checked={this.state.thisViewsViewSettingObj.buildson}></input></li>
                    <li>Reference <input type="checkbox" name="references" onChange={this.handleViewSettingsChange} checked={this.state.thisViewsViewSettingObj.references}></input></li>
                    <li>Group <input type="checkbox" name="showGroup" onChange={this.handleViewSettingsChange} checked={this.state.thisViewsViewSettingObj.showGroup}></input></li>
                    <li>Author <input type="checkbox" name="showAuthor" onChange={this.handleViewSettingsChange} checked={this.state.thisViewsViewSettingObj.showAuthor}></input></li>
                    <li>Date <input type="checkbox" name="showTime" onChange={this.handleViewSettingsChange} checked={this.state.thisViewsViewSettingObj.showTime}></input></li>
                  </ul>
                </Popover.Content>
              ) : null}
              {/* END PERMANENT SETTINGS SPECIFIC TO THIS VIEW */}

              {/* PERMANENT COMMUNITY WIDE SETTINGS */}
              {(this.props.author && this.props.author.role === "manager") ? (
                <Popover.Title>Community Settings<a className="saveCommunitySettingsIcon" onClick={this.pushCommunitySettingsChange}><i className="far fa-save"></i></a></Popover.Title>
              ) : null}
              {(this.props.author && this.props.author.role === "manager") ? (
                <Popover.Content>
                  <ul id="communitySettingsPopoverList" className="settingsPopoverList">
                    <li>Buildson <input type="checkbox" name="buildson" onChange={this.handleViewSettingsChange} checked={this.state.communityViewSettingsObj.buildson}></input></li>
                    <li>Reference <input type="checkbox" name="references" onChange={this.handleViewSettingsChange} checked={this.state.communityViewSettingsObj.references}></input></li>
                    <li>Group <input type="checkbox" name="showGroup" onChange={this.handleViewSettingsChange} checked={this.state.communityViewSettingsObj.showGroup}></input></li>
                    <li>Author <input type="checkbox" name="showAuthor" onChange={this.handleViewSettingsChange} checked={this.state.communityViewSettingsObj.showAuthor}></input></li>
                    <li>Date <input type="checkbox" name="showTime" onChange={this.handleViewSettingsChange} checked={this.state.communityViewSettingsObj.showTime}></input></li>
                  </ul>
                </Popover.Content>
              ) : null}
              {/* END PERMANENT COMMUNITY WIDE SETTINGS */}

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
        communitySettings: state.globals.communitySettings,
        view: state.globals.view,
        currViewSettingsObj: state.globals.currViewSettingsObj,
        thisViewsViewSettingObj: state.globals.thisViewsViewSettingsObj,
        communityViewSettingsObj: state.globals.communityViewSettingsObj,
    }
}

const mapDispatchToProps = {
    setView,
    setCommunitySettings,
    setCurrViewSettingsObj
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewSettingsPopover);
