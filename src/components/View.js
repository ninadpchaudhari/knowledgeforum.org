import React, { Component } from 'react';
import { connect } from 'react-redux'

import { setServer, setToken } from '../store/api.js';
import { setViewId, fetchViewCommunityData } from '../store/globalsReducer.js'
import { fetchLoggedUser } from '../store/globalsReducer.js'
import Graph from '../Graph';
import "./View.css";
import SideBar from "./SideBar.js"
import DialogHandler from './dialogHandler/DialogHandler.js'

class View extends Component {

    componentDidMount() {
        // FETCH VIEW-COMMUNITY DATA

        const token = this.props.location.state.token;
        const server= this.props.location.state.server;

        const communityId= this.props.location.state.communityId;
        const viewId= this.props.location.state.viewId;

        setServer(server);
        setToken(token);

        console.log(token)
        console.log(server)
        console.log(communityId)
        console.log(viewId)

        this.props.fetchLoggedUser()
        if (this.props.viewId) {
            this.props.fetchViewCommunityData(this.props.viewId)
        }
        /* const viewId = this.props.match.params.viewId //Get viewId from url param */
        this.props.setViewId(viewId)
        this.setState(this.props.location.state);
    }


    componentDidUpdate(prevProps, prevState) {
        if (this.props.viewId && this.props.viewId !== prevProps.viewId) {
            this.props.fetchViewCommunityData(this.props.viewId)
        }
    }

    render(){
    return(
        <div className="container-fluid">
            <DialogHandler />
            <div className="row" >
                <div className="col" id="sticky-sidebar">
                    <SideBar communityId={this.props.communityId}
                             view={this.props.view}
                        author={this.props.author}
                    />
                </div>
                <div className="col" id="main-canvas">
                    <Graph location={this.props.location} />
                </div>
            </div>
        </div>
    )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        communityId: state.globals.communityId,
        viewId: state.globals.viewId,
        view: state.globals.view,
        author: state.globals.author,
    }
}
const mapDispatchToProps = {
    setViewId,
    fetchViewCommunityData,
    fetchLoggedUser
};


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(View)
