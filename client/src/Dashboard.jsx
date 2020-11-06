import React, {Component} from 'react';
import Select from 'react-select';

import $ from 'jquery';
import {appendUserServers} from './helper/Dashboard_helper.js';
import {loadServer} from './helper/Dashboard_helper.js';
import {joinCommunity} from './helper/Dashboard_helper.js';
import {toggleSidebar} from './helper/Dashboard_helper.js';
import {logout} from './helper/Dashboard_helper.js';
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
    }
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
      var status = (server == activeServerURL) ? "active" : "inactive";
      if(server == activeServerURL) { this.setState({token: serverTokenPairs[i][1]}); }
      serverTokenPair.push([server, token, status]);
    }
    localStorage.setItem(this.state.username, JSON.stringify(serverTokenPair));

    // loads the server specific data
    loadServer(serverURL, this);
  }

  handleDropDownChange = (event) => {
    this.setState({selectedCommunityToJoin: {value: event.value, label: event.label}});
  }

  componentDidMount() {
    appendUserServers(this);
  }

  render(){
    return (
      <div className="d-flex" id="wrapper">

        <div className="sidebar-custom" id="sidebar-wrapper">
          <h1 className="sidebar-heading">Your Servers:</h1>
          <div className="list-group list-group-flush">
            <ul className = "server-list" id = "server-list">{this.state.serverList.map((s) =>
                    <li key={s.name} onClick={this.serverSelectHandler} class={s.class}>{s.name}</li>)}</ul>
          </div>
        </div>

        <div id="page-content-wrapper">

          <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
            <button className="d-none d-md-block btn btn-primary select-server" id="menu-toggle" onClick={toggleSidebar}>Select Server</button>
            <button className="d-md-none btn btn-primary select-server" id="menu-toggle" onClick={toggleSidebar}><i className="fas fa-server"></i></button>
            <div class="currentInfo" id="currentInfo">{this.state.name}<div></div>{this.state.currentServerName}</div>

            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav ml-auto mt-2 mt-lg-0">
                <li className="nav-item">
                  <a className="nav-link" href="" id="logout" onClick={() => logout(this)}>Logout</a>
                </li>
              </ul>
            </div>
          </nav>

          <div className="container-fluid">
            <div className = "row">

              <div className = "col-md-6 mainContentCol">
                <h1>My Knowledge Building Communities</h1>
                <ul className="userCommunities" id = "userCommunities">
                  {this.state.userCommunityData.map((c) =>
                    <li><p>{c.title}</p><a href={c.server + 'auth/jwt?token=' + c.token + '&redirectUrl=/view/' + c.welcomeViewId} target="_blank"><button class="enterButton" type="button"><i class="far fa-arrow-alt-circle-right"></i></button></a></li>)}
                </ul>
              </div>

              <div className = "col-md-6 mainContentCol">
                <h1>Join Community</h1>
                <form className="col-lg-8 col-md-10 col-sm-12 joinCommunityForm" id = "joinCommunityForm">

                  <label for="server">Community:</label><br></br>
                  <Select value={this.state.selectedCommunityToJoin}
                          className="communityChoiceDropdown"
                          id="communityChoiceDropdown"
                          options={this.state.serverCommunityData}
                          onChange={this.handleDropDownChange}
                          required>
                  </Select><br></br>

                  <label for="communityKey">Community Registration Key:</label><br></br>
                  <input type="text" id="communityKey" name="communityRegistrationKey" required onChange={this.inputChangeHandler}></input><br></br>

                  <div>
                    <p style={{color: 'red'}} id = "errorMessage">{this.state.joinCommunityErrorMessage}</p>
                  </div>

                  <input className = "joinButton" type="button" value="Join"
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

export default Dashboard;
