import React, {Component} from 'react';
import { connect } from 'react-redux'
import Select from 'react-select';

import { setGlobalToken, setCurrentServer, setCommunityId, setViewId } from './store/globalsReducer.js';

import $ from 'jquery';
import {appendUserServers, loadServer, joinCommunity, toggleSidebar, logout} from './helper/Dashboard_helper.js';
import {getServerURL} from './config.js';

import './css/Dashboard.css';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      username: null,
      name: null,
      userId: null,
      currentServerURL: null,
      currentServerName: null,
      serverList: [],
      userCommunityData: [],
      serverCommunityData: [],
      selectedCommunityToJoin: null,
      communityRegistrationKey: null,
      joinCommunityErrorMessage: null,
      viewType: {value: 'Classic', label: 'Classic'}
    }

    this.enterCommunity = this.enterCommunity.bind(this);
  }

  inputChangeHandler = (event) => {
    let name = event.target.name;
    let value = event.target.value;
    this.setState({[name]: value});
  }

  serverSelectHandler = (event) => {
    var domElement = event.target;
    var serverName = event.target.innerText;
    var serverURL = getServerURL(event.target.innerText);
    var serverTokenPairs = JSON.parse(localStorage.getItem(this.state.username));

    this.setState({currentServerURL: getServerURL(serverName)});
    this.setState({currentServerName: serverName});

    // handles active tag in html
    $(domElement).addClass('active').siblings().removeClass('active');

    // handles the active tag in local storage
    var activeServerURL = getServerURL(serverName);
    var serverTokenPair = [];
    for(var i in serverTokenPairs){
      var server = serverTokenPairs[i][0];
      var token = serverTokenPairs[i][1];
      var status = (server === activeServerURL) ? "active" : "inactive";
      if(server === activeServerURL) { this.setState({token: serverTokenPairs[i][1]}); }
      serverTokenPair.push([server, token, status]);
    }
    localStorage.setItem(this.state.username, JSON.stringify(serverTokenPair));

    // loads the server specific data
    loadServer(serverURL, this);
  }

  handleViewChange = (event) => {
    this.setState({viewType: {value: event.value, label: event.label}});
  }

  handleCommunityDropDownChange = (event) => {
    this.setState({selectedCommunityToJoin: {value: event.value, label: event.label}});
  }

  enterCommunity(c){
    // localStorage.setItem("cToken", c.token);
    // localStorage.setItem("cServer", c.server);
    // localStorage.setItem("cCommunityId", c.communityId);
    // localStorage.setItem("cViewId", c.welcomeViewId);

    this.props.setGlobalToken(c.token);
    this.props.setCurrentServer(c.server);
    this.props.setCommunityId(c.communityId);
    this.props.setViewId(c.welcomeViewId);
    this.props.history.push({
      pathname: '/graph',
    });
  }

  componentDidMount() {
    appendUserServers(this);
  }

  render(){
    let viewToRender;
    if(this.state.viewType.value === "Classic"){
      viewToRender = this.state.userCommunityData.map((c) =>
      <li key={c.communityId}>
        <p>{c.title}</p>
        <a href={c.server + 'auth/jwt?token=' + c.token + '&redirectUrl=/view/' + c.welcomeViewId} target="_blank" rel="noopener noreferrer">
        <button className="dashboard-enterButton" type="button"><i className="far fa-arrow-alt-circle-right"></i></button></a>
      </li>);
    } else if(this.state.viewType.value === "Enhanced"){
      viewToRender = this.state.userCommunityData.map((c) =>
        <li key={c.communityId}>
            <p>{c.title}</p>
            <button className="dashboard-enterButton" type="button" onClick={() => this.enterCommunity(c)}>
            <i className="far fa-arrow-alt-circle-right"></i></button>
        </li>);
    }


    return (
      <div className="d-flex" id="wrapper">

        <div className="sidebar-custom dashboard-sidebar-custom" id="sidebar-wrapper">
          <h1 className="sidebar-heading dashboard-sidebar-heading">Your Servers:</h1>
          <div className="list-group list-group-flush">
            <ul className = "dashboard-server-list" id = "server-list">{this.state.serverList.map((s) =>
                    <li key={s.name} onClick={this.serverSelectHandler} className={s.class}>{s.name}</li>)}</ul>
            <div className="dashboard-viewDropDownContainer">
              <p>View Type:</p>
              <Select isSearchable={false}
                      value = {this.state.viewType}
                      onChange = {this.handleViewChange}
                      options={[
                        { value: 'Classic', label: 'Classic' },
                        { value: 'Enhanced', label: 'Enhanced' },
                      ]} />
            </div>
          </div>
        </div>

        <div id="page-content-wrapper">

          <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom dashboard-navbar">
            <button className="d-none d-md-block btn btn-primary dashboard-select-server" id="menu-toggle" onClick={toggleSidebar}>Select Server</button>
            <button className="d-md-none btn btn-primary dashboard-select-server" id="menu-toggle" onClick={toggleSidebar}><i className="fas fa-server"></i></button>
            <div className="dashboard-currentInfo" id="currentInfo">{this.state.name}<div></div>{this.state.currentServerName}</div>

            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav ml-auto mt-2 mt-lg-0">
                <li className="nav-item">
                  <button className="nav-link dashboard-nav-link btn btn-link" href="" id="logout" onClick={() => logout(this)}>Logout</button>
                </li>
              </ul>
            </div>
          </nav>

          <div className="container-fluid">
            <div className = "row">

              <div className = "col-md-6 dashboard-mainContentCol">
                <h1>My Knowledge Building Communities</h1>
                <ul className="dashboard-userCommunities" id = "userCommunities">
                  {viewToRender}
                </ul>
              </div>

              <div className = "col-md-6 dashboard-mainContentCol">
                <h1>Join Community</h1>
                <form className="col-lg-8 col-md-10 col-sm-12 dashboard-joinCommunityForm" id = "joinCommunityForm" autoComplete="off">

                  <label htmlFor="server">Community:</label><br></br>
                  <Select value={this.state.selectedCommunityToJoin}
                          className="dashboard-communityChoiceDropdown"
                          id="communityChoiceDropdown"
                          options={this.state.serverCommunityData}
                          onChange={this.handleCommunityDropDownChange}
                          required>
                  </Select><br></br>

                  <label htmlFor="communityKey">Community Registration Key:</label><br></br>
                  <input className="dashboard-communityKeyInput" type="text" id="communityKey" name="communityRegistrationKey" required onChange={this.inputChangeHandler}></input><br></br>

                  <div>
                    <p style={{color: 'red'}} id = "errorMessage">{this.state.joinCommunityErrorMessage}</p>
                  </div>

                  <input className = "dashboard-joinButton" type="button" value="Join"
                      onClick={() => joinCommunity(this.state.userId, this.state.currentServerURL, this.state.communityRegistrationKey, this.state.selectedCommunityToJoin.value, this)} id="joinCommunityButton"></input>

                </form>
              </div>

            </div>

          </div>
        </div>


      </div>
    )
  }
}

const mapDispatchToProps = {
    setGlobalToken,
    setCurrentServer,
    setCommunityId,
    setViewId,
}

export default connect(
    null,
    mapDispatchToProps,
)(Dashboard)
