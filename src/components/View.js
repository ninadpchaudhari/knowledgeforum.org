import React, { Component } from 'react';
import { connect } from 'react-redux'
import { DropdownButton, Dropdown, Button, Row, Col, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { setViewId, fetchViewCommunityData } from '../store/globalsReducer.js'
import { newNote, openContribution, setCheckedNotes } from '../store/noteReducer.js'
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
          currentView: this.props.location.state.currentView,
          communityTitle: this.props.location.state.communityTitle,
          showModal: false,
        }

        this.onViewClick = this.onViewClick.bind(this);
        this.newView = this.newView.bind(this);
        this.handleShow = this.handleShow.bind(this);
    }

    componentDidMount() {

        if (this.props.viewId) {
            this.props.fetchViewCommunityData(this.props.viewId)
        }else{
            const viewId = this.props.match.params.viewId //Get viewId from url param
            this.props.setViewId(viewId)
        }

    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.viewId && this.props.viewId !== prevProps.viewId) {
            this.props.fetchViewCommunityData(this.props.viewId)
        }
    }

    onViewClick(viewId){
        this.props.setViewId(viewId);
        this.props.history.push({pathname: `/view/${viewId}`})
    }

    newView() {
        this.setState({
            showView: true,
            showModel: true,
        })
    }

    handleShow(value) {
        this.setState({
            showModel: value,
        });
    }

    goToDashboard = () => {
        this.props.history.push("/dashboard");
    }

    switchView = () => {
      if(this.state.currentView === "Enhanced"){
        this.setState({ currentView: "Light" });
      } else if(this.state.currentView === "Light"){
        this.setState({ currentView: "Enhanced" });
      }
    }

    renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            {props.message}
        </Tooltip>
    );

    render(){

      let viewToRender;
      if(this.state.currentView === "Enhanced"){
        viewToRender = <GraphView currentView={this.state.currentView} onViewClick={this.onViewClick} onNoteClick={(noteId)=>this.props.openContribution(noteId, "write")} />;
      } else if(this.state.currentView === "Light"){
        viewToRender = <LightView currentView={this.state.currentView}/>;
      }

      return(
          <div className="container-fluid">
              <DialogHandler />

              <div className="row">
                  {<TopNavBar communityTitle={this.state.communityTitle}></TopNavBar>}
              </div>

              <div className="row" >

                  {/* SIDEBAR */}
                  <div className="col-1" id="sticky-sidebar">
                    <DropdownButton drop="right" variant="outline-info" title={<i className="fas fa-plus-circle"></i>}>

                        <Dropdown.Item onClick={() => this.props.newNote(this.props.view, this.props.communityId, this.props.author._id)}>
                            New Note
                        </Dropdown.Item>

                        <Dropdown.Item onClick={() => this.newView()}>
                            new View
                        </Dropdown.Item>
                    </DropdownButton>

                    <OverlayTrigger
                        placement="right"
                        delay={{ show: 250, hide: 400 }}
                        overlay={this.renderTooltip({ message: "Exit Community" })}>
                        <Button onClick={this.goToDashboard} className="circle-button" variant="outline-info"><i className="fa fa-arrow-left"></i></Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                        placement="right"
                        delay={{ show: 250, hide: 400 }}
                        overlay={this.renderTooltip({ message: "Change View" })}>
                        <Button onClick={this.switchView} className="circle-button pad" variant="outline-info">
                            <i className="fa fa-globe"></i>
                        </Button>
                    </OverlayTrigger>
                  </div>
                  {/* END SIDEBAR */}

                  {/* MAIN CANVAS */}
                  <div className="col-11" id="main-canvas">
                      {viewToRender}
                  </div>
                  {/* END MAIN CANVAS */}
              </div>

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
    }
}

const mapDispatchToProps = {
    setViewId,
    fetchViewCommunityData,
    openContribution,
    newNote
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(View)
