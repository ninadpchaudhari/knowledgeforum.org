import React, {Component} from 'react';

import $ from 'jquery';
import {toggleSidebar} from './helper/Dashboard_helper.js';

import './css/Dashboard.css';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      name: null,
      server: null,
      userCommunityData: null,
      serverCommunityData: null,
    }
  }

  componentDidMount(){

  }

  render(){
    return (
      <div className="d-flex" id="wrapper">

        <div className="sidebar-custom" id="sidebar-wrapper">
          <h1 className="sidebar-heading">Your Servers:</h1>
          <div className="list-group list-group-flush">
            <ul className = "server-list" id = "server-list">
            </ul>
          </div>
        </div>

        <div id="page-content-wrapper">

          <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
            <button className="d-none d-md-block btn btn-primary select-server" id="menu-toggle" onclick="toggleSidebar()">Select Server</button>
            <button className="d-md-none btn btn-primary select-server" id="menu-toggle" onclick="toggleSidebar()"><i className="fas fa-server"></i></button>
            <div className="currentInfo" id="currentInfo"></div>

            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav ml-auto mt-2 mt-lg-0">
                <li className="nav-item">
                  <a className="nav-link" href="#" id="logout" onclick="logout()">Logout</a>
                </li>
              </ul>
            </div>
          </nav>

          <div className="container-fluid">
            <div className = "row">

              <div className = "col-md-6 mainContentCol">
                <h1>My Knowledge Building Communities</h1>
                <ul className="userCommunities" id = "userCommunities">
                  <div className = "loader"></div>
                </ul>
              </div>

              <div className = "col-md-6 mainContentCol">
                <h1>Join Community</h1>
                <form className="col-lg-8 col-md-10 col-sm-12 joinCommunityForm" id = "joinCommunityForm">

                  <label for="server">Community:</label><br></br>
                  <select value="getCommunity" className="communityChoiceDropdown" id="communityChoiceDropdown" required>
                  </select><br></br>

                  <label for="communityKey">Community Registration Key:</label><br></br>
                  <input type="text" id="communityKey" name="communityKey" required></input><br></br>

                  <div>
                    <p style={{display: 'hidden', color: 'red'}} id = "errorMessage"></p>
                  </div>

                  <input className = "joinButton" type="button" value="Join" onclick="joinCommunity()" id="joinCommunityButton"></input>

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
