import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap';
import { setViewId, fetchViewCommunityData } from '../store/globalsReducer.js'
import {openContribution}from '../store/noteReducer.js'
import Graph from '../Graph';
import "./View.css";
import SideBar from "./SideBar.js"
import DialogHandler from './dialogHandler/DialogHandler.js'

class View extends Component {

    constructor(props){
        super(props)
        this.onViewClick = this.onViewClick.bind(this);
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

    render(){
      return(
          <div className="container-fluid">
              <div className="row view-top-nav-bar">
                <Button className="view-dashboard-return-button" onClick={() => this.props.history.push("/dashboard")}>Return to Dashboard <i className="fas fa-sign-out-alt"></i></Button>
              </div>
              <DialogHandler />
              <div className="row" >
                  <div className="col" id="sticky-sidebar">
                      <SideBar communityId={this.props.communityId}
                               view={this.props.view}
                          author={this.props.author}
                      />
                  </div>
                  <div className="col" id="main-canvas">
                      <Graph token={this.props.token}
                             server={this.props.currentServer}
                             communityId={this.props.communityId}
                             viewId={this.props.viewId}
                             onViewClick={this.onViewClick}
                             onNoteClick={(noteId)=>this.props.openContribution(noteId, "write")}
                      />
                  </div>
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
    openContribution
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(View)
