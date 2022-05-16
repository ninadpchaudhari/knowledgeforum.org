import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  DropdownButton,
  Dropdown,
  Button,
  Row,
  Col,
  Popover,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { Form, FormGroup, Label, Input } from "reactstrap";
import Axios from "axios";
import {
  apiUrl,
  postSearchContribution,
  getCommunity,
  putCommunity,
  postLink,
  getViews,
} from "../../store/api.js";
import {
  setViewId,
  fetchViewCommunityData,
  fetchNewViewDifference,
  getContribution,
} from "../../store/globalsReducer.js";
import {
  setViewLinks,
  setBuildsOn,
  setReadLinks,
  newNote,
  openContribution,
  newDrawing,
} from "../../store/noteReducer.js";
import { clearAuthors } from "../../store/userReducer.js";
import TopNavBar from "./TopNavbar.js";
import AttachPanel from "../attachmentCollapse/AttachPanel.js";
import GraphView from "./GraphView/GraphView.jsx";
import CommonKeyView from "./GraphView/commonKeyView.js";
import LightView from "./LightView/LightView.js";
import ViewSettingsPopover from "./ViewSettingsPopover.jsx";
import "../../index.css";
import "./View.css";
import DialogHandler from "../dialogHandler/DialogHandler.js";
import NewRiseAboveModal from "../modals/NewRiseAboveModal.js";
import { WebSocketContext } from "../../WebSocket.js";

class View extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: sessionStorage.getItem("token"),
      currentView:
        this.props.location !== undefined &&
        this.props.location.state !== undefined
          ? this.props.location.state.currentView
          : "Enhanced",
      communityTitle:
        this.props.location !== undefined &&
        this.props.location.state !== undefined
          ? this.props.location.state.communityTitle
          : this.props.demoCommunityTitle !== undefined
          ? this.props.demoCommunityTitle
          : null,
      layout: "preset",
      addView: "",
      showModal: false,
      showView: false,
      showAttachPanel: false,
      showRiseAboveModal: false,
      nodes: [],
      authors: [],
      keywordData: {},
    };

    this.clearGraphViewProps = this.clearGraphViewProps.bind(this);
    this.onViewClick = this.onViewClick.bind(this);
    this.handleNewViewInput = this.handleNewViewInput.bind(this);
    this.handleNewViewSubmit = this.handleNewViewSubmit.bind(this);
    this.newView = this.newView.bind(this);
    this.handleShow = this.handleShow.bind(this);
  }

  componentDidMount() {
    var viewId = this.props.viewId
      ? this.props.viewId
      : this.props.match.params.viewId;
    this.context.openConnection(viewId, "link"); //Open websocket connection and subscribe to view
    this.props.fetchViewCommunityData(viewId);

    this.props.getContribution(viewId);
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.viewId && this.props.viewId !== prevProps.viewId) {
      this.props.fetchNewViewDifference(this.props.viewId);
      if (this.props.socketStatus && prevProps.viewId) {
        //If changing view and socket connection
        this.context.unsubscribeToView(prevProps.viewId);
        this.context.subscribeToView(this.props.viewId);
      }
    }
    //console.log(authors)
  }

  componentWillUnmount() {
    if (this.props.socketStatus) {
      this.context.unsyncUpdates("link");
      this.context.unsubscribeToView(this.props.viewId);
      this.context.disconnect();
    }
  }

  clearGraphViewProps() {
    this.props.setViewLinks([]);
    this.props.setBuildsOn([]);
    this.props.setReadLinks([]);
    this.props.clearAuthors([]);
  }

  onViewClick(viewId) {
    this.handleShow(false);
    this.props.setViewId(viewId);
    if (this.props.isDemo === false) {
      this.props.history.push({
        pathname: `/view/${viewId}`,
        state: {
          currentView: this.state.currentView,
          communityTitle: this.state.communityTitle,
        },
      });
    }
  }

  newView() {
    this.setState({
      showView: true,
      showModel: true,
    });
  }

  // SET VALUES
  handleNewViewInput = (e) => {
    let target = e.target;
    let name = target.name;
    let value = target.value;

    this.setState({
      [name]: value,
    });
  };

  handleNewViewSubmit(e) {
    e.preventDefault();
    var config = {
      headers: { Authorization: `Bearer ${this.state.token}` },
    };

    var addViewUrl = `${apiUrl}/contributions/${this.props.communityId}`;

    var query = {
      authors: [this.props.author._id],
      communityId: this.props.communityId,
      permission: "public",
      status: "active",
      title: this.state.addView,
      type: "View",
    };
    Axios.post(addViewUrl, query, config)
      .then((result) => {
        //get new view Id
        let newViewId = result.data._id;
        getCommunity(this.props.communityId)
          .then((data) => {
            data.data.views.push(newViewId);
            putCommunity(data.data, this.props.communityId).then((obj) => {
              getViews(this.props.communityId).then((viewsObj) => {
                let pos = {
                  x: 1000,
                  y: 1000,
                };
                postLink(this.props.viewId, newViewId, "contains", pos).then(
                  (linkObj) => {
                    alert("View Added");
                    window.location.reload(false);
                  }
                );
              });
            });
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleShow(value) {
    this.setState({
      showModel: value,
    });
  }

  goToDashboard = () => {
    this.clearGraphViewProps();
    this.props.history.push("/dashboard");
  };

  switchView = () => {
    var nextView = this.state.currentView === "Enhanced" ? "Light" : "Enhanced";
    this.setState({ currentView: nextView });
  };

  renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {props.message}
    </Tooltip>
  );

  updateLayout = (e) => {
    this.setState({ layout: e.target.value });
  };

  render() {
     
    const authors = this.state.nodes.map((node) => node?.data?.author);
    const result = authors.reduce(
      (acc, curr) => ((acc[curr] = (acc[curr] || 0) + 1), acc),
      {}
    );

    let viewToRender =
      this.state.currentView === "Enhanced" ? (
        <GraphView
          setNode={(v) => this.setState({ nodes: v })}
          layout={this.state.layout}
          viewId={this.props.viewId}
          viewLinks={this.props.viewLinks}
          readLinks={this.props.readLinks}
          onViewClick={this.onViewClick}
          onNoteClick={(noteId) => this.props.openContribution(noteId, "write")}
          updateParentLayoutProp={this.updateLayout}
        />
      ) : (
        <LightView />
      );
    let viewCommonKeyWords =
      this.state.currentView === "Enhanced" ? (
        <CommonKeyView contributionData={this.props.contributionData} result={result}/>
      ) : (
        <LightView />
      );

    return (
      <div
        className="container-fluid d-flex flex-column"
        id="container-fluid-for-view-js"
      >
        <DialogHandler />
        <AttachPanel
          attachPanel={this.state.showAttachPanel}
          viewId={this.props.viewId}
          onClose={() => this.setState({ showAttachPanel: false })}
        />
        <NewRiseAboveModal
          show={this.state.showRiseAboveModal}
          handleClose={() => this.setState({ showRiseAboveModal: false })}
        />
        <div className="row">
          {
            <TopNavBar
              currentView={this.state.currentView}
              onViewClick={this.onViewClick}
              goToDashboard={this.goToDashboard}
              communityTitle={this.state.communityTitle}
            ></TopNavBar>
          }
        </div>

        <div className="row flex-grow-1">
          {/* SIDEBAR */}
          <div className="col-md" id="sticky-sidebar">
            <div className="row sidebar-list">
              {this.props.isDemo === false ? (
                <div className="sidebar-list-col col col-sm col-md-12">
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={this.renderTooltip({
                      message: "Create New Contribution",
                    })}
                  >
                    <DropdownButton
                      drop="right"
                      className="dropdown-btn-parent"
                      title={<i className="fas fa-plus-circle"></i>}
                    >
                      <Dropdown.Item
                        onClick={() =>
                          this.props.newNote(
                            this.props.view,
                            this.props.communityId,
                            this.props.author._id
                          )
                        }
                      >
                        New Note
                      </Dropdown.Item>

                      <Dropdown.Item onClick={() => this.newView()}>
                        New View
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => this.setState({ showAttachPanel: true })}
                      >
                        New Attachment
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() =>
                          this.props.newDrawing(
                            this.props.viewId,
                            this.props.communityId,
                            this.props.author._id
                          )
                        }
                      >
                        New Drawing
                      </Dropdown.Item>
                    </DropdownButton>
                  </OverlayTrigger>
                </div>
              ) : null}

              {/*<div className="sidebar-list-col col col-sm col-md-12">
                      <OverlayTrigger
                          placement="auto"
                          delay={{ show: 250, hide: 400 }}
                          overlay={this.renderTooltip({ message: "Exit Community" })}>
                          <Button onClick={this.goToDashboard} className="circle-button sidebar-btn"><i className="fas fa-home"></i></Button>
                      </OverlayTrigger>
                      </div>*/}

              <div className="sidebar-list-col col col-sm col-md-12">
                <ViewSettingsPopover
                  currentView={this.state.currentView}
                  switchView={this.switchView}
                />
              </div>

              {this.state.currentView === "Enhanced" ? (
                <div className="sidebar-list-col col col-sm col-md-12">
                  <OverlayTrigger
                    placement="auto"
                    trigger="click"
                    delay={{ show: 0, hide: 0 }}
                    rootClose
                    overlay={
                      <Popover id="layoutPopover">
                        <Popover.Title>Layouts (Temporary)</Popover.Title>
                        <Popover.Content>
                          <Row>
                            <Button
                              value="preset"
                              onClick={this.updateLayout}
                              className={
                                this.state.layout === "preset"
                                  ? "activeLayout"
                                  : ""
                              }
                            >
                              Original
                            </Button>
                          </Row>
                          <Row>
                            <Button
                              value="grid"
                              onClick={this.updateLayout}
                              className={
                                this.state.layout === "grid"
                                  ? "activeLayout"
                                  : ""
                              }
                            >
                              Grid
                            </Button>
                          </Row>
                          <Row>
                            <Button
                              value="circle"
                              onClick={this.updateLayout}
                              className={
                                this.state.layout === "circle"
                                  ? "activeLayout"
                                  : ""
                              }
                            >
                              Circle
                            </Button>
                          </Row>
                          <Row>
                            <Button
                              value="spread"
                              onClick={this.updateLayout}
                              className={
                                this.state.layout === "spread"
                                  ? "activeLayout"
                                  : ""
                              }
                            >
                              Spread
                            </Button>
                          </Row>
                          <Row>
                            <Button
                              value="cose"
                              onClick={this.updateLayout}
                              className={
                                this.state.layout === "cose"
                                  ? "activeLayout"
                                  : ""
                              }
                            >
                              Cose
                            </Button>
                          </Row>
                        </Popover.Content>
                      </Popover>
                    }
                  >
                    <Button className="circle-button pad sidebar-btn">
                      <i className="fas fa-object-group"></i>
                    </Button>
                  </OverlayTrigger>
                </div>
              ) : null}
            </div>
          </div>
          {/* MAIN CANVAS */}
          <div
            className="col-md"
            id="main-canvas"
            style={{ marginRight: "20px", maxWidth: "calc(100% - 220px)" }}
          >
            {viewToRender}
          </div>
          {/* <div className='col-md' id='author-bar' style={{ maxWidth: '220px', zIndex: 500, float: 'right' }}>
            <DropdownButton align="end"
              max
              style={{ 'width': '100%', 'maxWidth': '220px' }}
              title={"Authors Note Count"}
              id="dropdown-menu-align-end">
              {
                Object.keys(result).length == 0 ?
                  <Dropdown.Item eventKey={'loading'}>{"Loading..."}</Dropdown.Item>
                  :
                  Object.keys(result).map((key, index) => (
                    <Dropdown.Item eventKey={index}>{key + " " + result[key]}</Dropdown.Item>
                  ))
              }
            </DropdownButton>
            { viewCommonKeyWords}
          </div> */}
          <div
            className="col-md"
            id="main-canvas"
            style={{ maxWidth: "300px" }}
          >
            {viewCommonKeyWords}
          </div>
          {/* END MAIN CANVAS */}
        </div>
        {/* MAIN CANVAS */}
        {/* <div className='col-md' id='main-canvas' style={{ maxWidth: 'calc(100% - 220px)' }}>
            {viewToRender}
          </div>
          <div className='col-md' id='author-bar' style={{ maxWidth: '220px' }}>
            <div className='author-header'>Authors Note Count</div>
            <div className='author-container'>
              {Object.keys(result).map(key => (
                <div key={key}>
                  {key} -- {result[key]}
                </div>
              ))}
            </div>
            <div className='author-header'>Keyword Count</div>
            <div>
              {Object.entries(this.state.keywordData)?.length > 0 && Object.entries(this.state.keywordData).map(([key, value]) => {
                const data111 = value?.length > 0 && value.map((val, ind) => ` ${val.title}`)
                return (
                  <div key={key}>
                    {key} :
                    {
                      data111.toString()
                    }
                  </div>
                )
              }
              )}
            </div>
          </div> */}
        {/* END MAIN CANVAS */}
        {/* </div> */}

        {/* MODAL */}
        <Modal
          show={this.state.showModel}
          onHide={() => this.handleShow(false)}
        >
          {this.state.showView ? (
            <>
              <Modal.Header closeButton>
                <Modal.Title>
                  <Row>
                    <Col>Views</Col>
                  </Row>
                  <Row>
                    <Col>
                      <Row>
                        <Form
                          onSubmit={this.handleNewViewSubmit}
                          className="form"
                        >
                          <Col>
                            <FormGroup>
                              <Label
                                htmlFor="addView"
                                style={{ fontSize: "1rem" }}
                              >
                                Add View
                              </Label>
                              <Input
                                type="text"
                                id="addView"
                                placeholder="Enter View Name"
                                name="addView"
                                value={this.state.addView}
                                onChange={this.handleNewViewInput}
                              />
                            </FormGroup>
                          </Col>
                          <Col>
                            <Button varient="secondary" type="submit">
                              Add
                            </Button>
                          </Col>
                        </Form>
                      </Row>
                    </Col>
                  </Row>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body
                style={{ maxHeight: "calc(100vh - 210px)", overflowY: "auto" }}
              >
                {this.props.myViews.map((obj, i) => {
                  return (
                    <Row key={i} value={obj.title} className="mrg-05-top">
                      <Col>
                        <Link onClick={() => this.onViewClick(obj._id)}>
                          {" "}
                          {obj.title}{" "}
                        </Link>
                      </Col>
                    </Row>
                  );
                })}
              </Modal.Body>
            </>
          ) : null}

          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.handleShow(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        {/* END MODAL */}
      </div>
    );
  }
}
View.contextType = WebSocketContext;

const mapStateToProps = (state, ownProps) => {
  return {
    isDemo: state.globals.isDemo,
    token: state.globals.token,
    currentServer: state.globals.currentServer,
    communityId: state.globals.communityId,
    viewId: state.globals.viewId,
    view: state.globals.view,
    author: state.globals.author,
    myViews: state.globals.views,
    socketStatus: state.globals.socketStatus,
    viewLinks: state.notes.viewLinks,
    readLinks: state.notes.readLinks,
    contributionData: state.notes.contributionData,
  };
};

const mapDispatchToProps = {
  setViewId,
  setViewLinks,
  setBuildsOn,
  setReadLinks,
  clearAuthors,
  fetchViewCommunityData,
  getContribution,
  fetchNewViewDifference,
  openContribution,
  newNote,
  newDrawing,
};

export default connect(mapStateToProps, mapDispatchToProps)(View);
