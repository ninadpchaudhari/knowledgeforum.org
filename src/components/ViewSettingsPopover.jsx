import React, { Component } from 'react';
import { Row, Col, OverlayTrigger, Popover, Accordion, Card, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import $ from 'jquery';
import { updateViewObject, updateCommunityContextObject } from '../store/async_actions.js';
import { setView, setCommunitySettings, setCurrViewSettingsObj } from '../store/globalsReducer.js';

class ViewSettingsPopover extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tempViewSettingObj: {buildson: true, language: false, references: false, showAuthor: true, showGroup: false, showTime: true},
      thisViewsViewSettingObj: null,
      communityViewSettingsObj: {buildson: false, language: false, references: false, showAuthor: false, showGroup: false, showTime: false},
    }

    this.initializeSettings = this.initializeSettings.bind(this);
    this.handleViewTypeChange = this.handleViewTypeChange.bind(this);
    this.handleViewSettingsChange = this.handleViewSettingsChange.bind(this);
    this.toggleViewSettingEnable = this.toggleViewSettingEnable.bind(this);
    this.pushViewSettingsChange = this.pushViewSettingsChange.bind(this);
    this.pushCommunitySettingsChange = this.pushCommunitySettingsChange.bind(this);
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.thisViewsViewSettingObj !== prevProps.thisViewsViewSettingObj || this.props.communityViewSettingsObj !== prevProps.communityViewSettingsObj
            || this.props.view !== prevProps.view || this.props.communitySettings !== prevProps.communitySettings){
      this.initializeSettings();
    }
  }

  // used to set initial values for each of the viewSettingObj states
  initializeSettings(){
    // assign values for this specific view and the community settings if they exist
    this.setState({thisViewsViewSettingObj: (this.props.thisViewsViewSettingObj !== null ? this.props.thisViewsViewSettingObj : null)})
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

  // handles the enabling and disabling of specific view settings by the manager
  // if a view objects viewSetting attribute is null the option is disabled
  // when enabling we just default all values to false, if the user sets values and saves them then it will update the view object and enable specific view settings
  toggleViewSettingEnable(){
    var isCurrentlyEnabled = this.state.thisViewsViewSettingObj !== null;
    if(isCurrentlyEnabled){
      var newObject = JSON.parse(JSON.stringify(this.props.view));
      newObject.data.viewSetting = null;
      this.props.updateViewObject(newObject);
    } else {
      this.setState({thisViewsViewSettingObj: {buildson: false, language: false, references: false, showAuthor: false, showGroup: false, showTime: false}});
    }
  }

  // updates this specific views settings in redux and on the backend
  pushViewSettingsChange(){
    var newObject = JSON.parse(JSON.stringify(this.props.view));
    newObject.data.viewSetting = Object.assign({}, this.state.thisViewsViewSettingObj);
    this.props.updateViewObject(newObject);
  }

  // updates this communitys context setting object in redux and on the backend
  pushCommunitySettingsChange(){
    var newObject = JSON.parse(JSON.stringify(this.props.communitySettings));
    newObject.data.viewSetting = Object.assign({}, this.state.communityViewSettingsObj);
    this.props.updateCommunityContextObject(newObject);
  }

  render() {
    var thisViewsViewSettingEnabled = this.state.thisViewsViewSettingObj !== null;

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


              <Popover.Content className="viewSettingsPopoverContent">
                <Accordion defaultActiveKey="0">

                    {/* TEMPORARY VIEW SETTINGS */}
                    <Card>
                        <Card.Header className="viewSettingsCardHeader">
                          <Accordion.Toggle as={Button} variant="link" eventKey="0">View Settings (Temporary) <i className="fas fa-angle-down"/></Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="0">
                          <Card.Body className="viewSettingsCardBody">
                              <ul id="tempSettingsPopoverList" className="settingsPopoverList">
                                <li>Buildson <input type="checkbox" name="buildson" onChange={this.handleViewSettingsChange} checked={this.state.tempViewSettingObj.buildson}></input></li>
                                <li>Reference <input type="checkbox" name="references" onChange={this.handleViewSettingsChange} checked={this.state.tempViewSettingObj.references}></input></li>
                                <li>Group <input type="checkbox" name="showGroup" onChange={this.handleViewSettingsChange} checked={this.state.tempViewSettingObj.showGroup}></input></li>
                                <li>Author <input type="checkbox" name="showAuthor" onChange={this.handleViewSettingsChange} checked={this.state.tempViewSettingObj.showAuthor}></input></li>
                                <li>Date <input type="checkbox" name="showTime" onChange={this.handleViewSettingsChange} checked={this.state.tempViewSettingObj.showTime}></input></li>
                              </ul>
                              <Button className="viewSettingsPopoverButton" onClick={this.initializeSettings}>Reset <i className="fas fa-undo-alt"></i></Button>
                          </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                    {/* END TEMPORARY VIEW SETTINGS */}

                    {/* PERMANENT SETTINGS SPECIFIC TO THIS VIEW */}
                    {(this.props.author && this.props.author.role === "manager") ? (
                      <Card>
                          <Card.Header className="viewSettingsCardHeader">
                            <Accordion.Toggle as={Button} variant="link" eventKey="1">View Settings (Permanent) <i className="fas fa-angle-down"/></Accordion.Toggle>
                          </Card.Header>
                          <Accordion.Collapse eventKey="1">
                            <Card.Body className="viewSettingsCardBody">
                                <ul id="viewSettingsPopoverList" className="settingsPopoverList">
                                  <li>Buildson <input type="checkbox" name="buildson" onChange={this.handleViewSettingsChange} disabled={!thisViewsViewSettingEnabled}
                                            checked={thisViewsViewSettingEnabled ? this.state.thisViewsViewSettingObj.buildson : false}></input></li>
                                  <li>Reference <input type="checkbox" name="references" onChange={this.handleViewSettingsChange} disabled={!thisViewsViewSettingEnabled}
                                            checked={thisViewsViewSettingEnabled ? this.state.thisViewsViewSettingObj.references : false}></input></li>
                                  <li>Group <input type="checkbox" name="showGroup" onChange={this.handleViewSettingsChange} disabled={!thisViewsViewSettingEnabled}
                                            checked={thisViewsViewSettingEnabled ? this.state.thisViewsViewSettingObj.showGroup : false}></input></li>
                                  <li>Author <input type="checkbox" name="showAuthor" onChange={this.handleViewSettingsChange} disabled={!thisViewsViewSettingEnabled}
                                            checked={thisViewsViewSettingEnabled ? this.state.thisViewsViewSettingObj.showAuthor : false}></input></li>
                                  <li>Date <input type="checkbox" name="showTime" onChange={this.handleViewSettingsChange} disabled={!thisViewsViewSettingEnabled}
                                            checked={thisViewsViewSettingEnabled ? this.state.thisViewsViewSettingObj.showTime : false}></input></li>
                                </ul>
                                <Button className={thisViewsViewSettingEnabled ? "viewSettingsPopoverButton" : "viewSettingsPopoverButton vsDisabled"} style={{width: "50%",}}
                                                                                                      onClick={this.pushViewSettingsChange}>Save <i className="far fa-save"></i></Button>
                                <Button className="viewSettingsPopoverButton" style={{width: "50%",}} onClick={this.toggleViewSettingEnable}>{thisViewsViewSettingEnabled ? "Disable" : "Enable"}</Button>
                            </Card.Body>
                          </Accordion.Collapse>
                      </Card>
                    ) : null}
                    {/* END PERMANENT SETTINGS SPECIFIC TO THIS VIEW */}

                    {/* PERMANENT COMMUNITY WIDE SETTINGS */}
                    {(this.props.author && this.props.author.role === "manager") ? (
                      <Card>
                          <Card.Header className="viewSettingsCardHeader">
                            <Accordion.Toggle as={Button} variant="link" eventKey="2">Community Settings <i className="fas fa-angle-down"/></Accordion.Toggle>
                          </Card.Header>
                          <Accordion.Collapse eventKey="2">
                            <Card.Body className="viewSettingsCardBody">
                                <ul id="communitySettingsPopoverList" className="settingsPopoverList">
                                  <li>Buildson <input type="checkbox" name="buildson" onChange={this.handleViewSettingsChange} checked={this.state.communityViewSettingsObj.buildson}></input></li>
                                  <li>Reference <input type="checkbox" name="references" onChange={this.handleViewSettingsChange} checked={this.state.communityViewSettingsObj.references}></input></li>
                                  <li>Group <input type="checkbox" name="showGroup" onChange={this.handleViewSettingsChange} checked={this.state.communityViewSettingsObj.showGroup}></input></li>
                                  <li>Author <input type="checkbox" name="showAuthor" onChange={this.handleViewSettingsChange} checked={this.state.communityViewSettingsObj.showAuthor}></input></li>
                                  <li>Date <input type="checkbox" name="showTime" onChange={this.handleViewSettingsChange} checked={this.state.communityViewSettingsObj.showTime}></input></li>
                                </ul>
                                <Button className="viewSettingsPopoverButton" onClick={this.pushCommunitySettingsChange}>Save <i className="far fa-save"></i></Button>
                            </Card.Body>
                          </Accordion.Collapse>
                      </Card>
                    ) : null}
                    {/* END PERMANENT COMMUNITY WIDE SETTINGS */}
                </Accordion>
              </Popover.Content>

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
    setCurrViewSettingsObj,
    updateViewObject,
    updateCommunityContextObject,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewSettingsPopover);
