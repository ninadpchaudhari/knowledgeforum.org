import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Link } from "react-router-dom";
import { DropdownButton, Dropdown, Button, Row, Col, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import Axios from 'axios';
import { apiUrl, getCommunity, putCommunity, postLink, getViews } from '../store/api.js';
import { setViewId, fetchViewCommunityData, fetchNewViewDifference } from '../store/globalsReducer.js'
import { setViewLinks, setBuildsOn, setReadLinks, newNote, openContribution } from '../store/noteReducer.js'
import { addAuthors } from '../store/userReducer.js';
import TopNavBar from '../TopNavBar/TopNavbar';
import GraphView from '../GraphView.jsx';
import LightView from '../View/LightView.js';
import '../css/index.css';
import "./View.css";
import DialogHandler from './dialogHandler/DialogHandler.js'

class View extends Component {

    constructor(props){
        super(props)
        this.state = {
          token: sessionStorage.getItem('token'),
          currentView: this.props.location.state === undefined ? "Enhanced" : this.props.location.state.currentView,
          communityTitle: this.props.location.state === undefined ? null : this.props.location.state.communityTitle,
          addView: '',
          showModal: false,
          showView: false,
        }

        this.clearGraphViewProps = this.clearGraphViewProps.bind(this);
        this.onViewClick = this.onViewClick.bind(this);
        this.handleNewViewInput = this.handleNewViewInput.bind(this);
        this.handleNewViewSubmit = this.handleNewViewSubmit.bind(this);
        this.newView = this.newView.bind(this);
        this.handleShow = this.handleShow.bind(this);
    }

    componentDidMount() {
        var viewId = this.props.viewId ? this.props.viewId : this.props.match.params.viewId;
        this.props.fetchViewCommunityData(viewId);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.viewId && this.props.viewId !== prevProps.viewId) {
          this.props.fetchNewViewDifference(this.props.viewId);
        }
    }

    clearGraphViewProps(){
      this.props.setViewLinks([]);
      this.props.setBuildsOn([]);
      this.props.setReadLinks([]);
      this.props.addAuthors([]);
    }

    onViewClick(viewId){
        this.handleShow(false);
        this.props.setViewId(viewId);
        this.props.history.push({
          pathname: `/view/${viewId}`,
          state: { currentView: this.state.currentView, communityTitle: this.state.communityTitle }
        });
        //window.location.reload();
    }

    newView() {
        this.setState({
            showView: true,
            showModel: true,
        })
    }

    // SET VALUES
    handleNewViewInput = (e) => {
        let target = e.target;
        let name = target.name;
        let value = target.value;

        this.setState({
            [name]: value
        });
    }

    handleNewViewSubmit(e) {
        e.preventDefault();
        var config = {
            headers: { Authorization: `Bearer ${this.state.token}` }
        };

        var addViewUrl = `${apiUrl}/contributions/${this.props.communityId}`;

        var query = {
            "authors": [this.props.author._id],
            "communityId": this.props.communityId,
            "permission": "public",
            "status": "active",
            "title": this.state.addView,
            "type": "View"
        }
        Axios.post(addViewUrl, query, config)
            .then(result => {
                //get new view Id
                let newViewId = result.data._id
                getCommunity(this.props.communityId).then(data => {
                    data.data.views.push(newViewId)
                    putCommunity(data.data, this.props.communityId).then(obj => {
                        getViews(this.props.communityId).then(viewsObj => {
                            let pos = {
                                x: 1000,
                                y: 1000
                            }
                            postLink(this.props.viewId, newViewId, 'contains', pos).then(linkObj => {
                                alert("View Added")
                                window.location.reload(false);
                            })
                        })
                    })
                }).catch(error => {
                    console.log(error);
                })
            }
            ).catch(
                error => {
                    console.log(error);

                }
            );
    }

    handleShow(value) {
        this.setState({
            showModel: value,
        });
    }

    goToDashboard = () => {
        this.clearGraphViewProps();
        this.props.history.push("/dashboard");
    }

    switchView = () => {
      var nextView = this.state.currentView === "Enhanced" ? "Light" : "Enhanced";
      this.setState({ currentView: nextView });
    }

    renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            {props.message}
        </Tooltip>
    );

    render(){
      let viewToRender = this.state.currentView === "Enhanced" ?
                <GraphView currentView={this.state.currentView} onViewClick={this.onViewClick} onNoteClick={(noteId)=>this.props.openContribution(noteId, "write")}/> : <LightView/>;

      return(
          <div className="container-fluid d-flex flex-column" id="container-fluid-for-view-js">
              <DialogHandler />

              <div className="row">
                  {<TopNavBar onViewClick={this.onViewClick} communityTitle={this.state.communityTitle}></TopNavBar>}
              </div>

              <div className="row flex-grow-1">

                  {/* SIDEBAR */}
                  <div className="col-md-1" id="sticky-sidebar">
                    <div className="row sidebar-list">
                      <div className="sidebar-list-col col-4 col-sm-4 col-md-12">
                      <DropdownButton drop="right" className="dropdown-btn-parent" title={<i className="fas fa-plus-circle"></i>}>

                          <Dropdown.Item onClick={() => this.props.newNote(this.props.view, this.props.communityId, this.props.author._id)}>
                              New Note
                          </Dropdown.Item>

                          <Dropdown.Item onClick={() => this.newView()}>
                              New View
                          </Dropdown.Item>
                      </DropdownButton>
                      </div>

                      <div className="sidebar-list-col col-4 col-sm-4 col-md-12">
                      <OverlayTrigger
                          placement="right"
                          delay={{ show: 250, hide: 400 }}
                          overlay={this.renderTooltip({ message: "Exit Community" })}>
                          <Button onClick={this.goToDashboard} className="circle-button sidebar-btn"><i className="fa fa-arrow-left"></i></Button>
                      </OverlayTrigger>
                      </div>

                      <div className="sidebar-list-col col-4 col-sm-4 col-md-12">
                      <OverlayTrigger
                          placement="right"
                          delay={{ show: 250, hide: 400 }}
                          overlay={this.renderTooltip({ message: "Change View" })}>
                          <Button onClick={this.switchView} className="circle-button pad sidebar-btn">
                              <i className="fa fa-globe"></i>
                          </Button>
                      </OverlayTrigger>
                      </div>
                    </div>
                  </div>
                  {/* END SIDEBAR */}

                  {/* MAIN CANVAS */}
                  <div className="col-md-11" id="main-canvas">
                      {viewToRender}
                  </div>
                  {/* END MAIN CANVAS */}

              </div>

              {/* MODAL */}
              <Modal show={this.state.showModel} onHide={() => this.handleShow(false)}>

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
                                              <Form onSubmit={this.handleNewViewSubmit} className="form">
                                                  <Col>
                                                      <FormGroup>
                                                          <Label htmlFor="addView" style={{ fontSize: "1rem" }}>Add View</Label>
                                                          <Input type="text" id="addView" placeholder="Enter View Name" name="addView" value={this.state.addView} onChange={this.handleNewViewInput} />
                                                      </FormGroup>
                                                  </Col>
                                                  <Col>
                                                      <Button varient="secondary" type="submit">Add</Button>
                                                  </Col>
                                              </Form>
                                          </Row>
                                      </Col>
                                  </Row>
                              </Modal.Title>
                          </Modal.Header>
                          <Modal.Body style={{ 'maxHeight': 'calc(100vh - 210px)', 'overflowY': 'auto' }}>
                              {this.props.myViews.map((obj, i) => {
                                  return <Row key={i} value={obj.title} className="mrg-05-top">
                                      <Col><Link onClick={() => this.onViewClick(obj._id)}> {obj.title} </Link></Col>
                                  </Row>
                              })}
                          </Modal.Body>
                      </>) : null}

                  <Modal.Footer>
                      <Button variant="secondary" onClick={() => this.handleShow(false)}>
                          Close
                  </Button>
                  </Modal.Footer>
              </Modal>
              {/* END MODAL */}

          </div>
      )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        token: state.globals.token,
        currentServer: state.globals.currentServer,
        communityId: state.globals.communityId,
        viewId: state.globals.viewId,
        view: state.globals.view,
        author: state.globals.author,
        myViews: state.globals.views,
    }
}

const mapDispatchToProps = {
    setViewId,
    setViewLinks,
    setBuildsOn,
    setReadLinks,
    addAuthors,
    fetchViewCommunityData,
    fetchNewViewDifference,
    openContribution,
    newNote
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(View)
