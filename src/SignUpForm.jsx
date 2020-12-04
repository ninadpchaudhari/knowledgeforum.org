import React, {Component} from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import {withRouter} from 'react-router';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Modal, Button } from 'react-bootstrap';
import { setCurrentLoginForm } from './store/globalsReducer.js'
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import {SERVERS, getServerURL, getServerName} from './config.js';
import {postNewUser, postNewSingaporeUser} from './api/user.js';

import './css/Login.css';
import './css/SignUpForm.css';

class SignUpForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      servers: null,
      firstname: null,
      lastname: null,
      email: null,
      username: null,
      password: null,
      confirmPassword: null,
      passwordError: null,
      registrationKey: null,
      errorMessage: [],
      singaporeSelected: false,
      showModal: false,
    }

    this.handleClose = this.handleClose.bind(this);
  }

  handleClose(){
    this.setState({showModal: false});
  }

  inputChangeHandler = (event) => {
    let name = event.target.name;
    let val = event.target.value;

    this.setState({[name] : val});
  }

  serverSelectHandler = (event) => {
    if(event === null) {
      this.setState({servers: null});
      this.setState({singaporeSelected:  false});
    } else {
      var selected_Servers = [];
      for(var i = 0; i < event.length; i++){
        selected_Servers.push(event[i].value);
      }
      selected_Servers.includes(getServerURL("Singapore")) ? this.setState({singaporeSelected: true}) : this.setState({singaporeSelected: false});
      this.setState({servers: selected_Servers});
    }
  }

  formSubmitHandler = (event) => {
    event.preventDefault();
    if(this.state.password !== this.state.confirmPassword){
      this.setState({passwordError: "Passwords do not match."});
      document.getElementById("passwordError").style.display = "visible";
      return false;
    }

    var servers = this.state.servers;
    var promises = [];

    for(var i = 0; i < servers.length; i++){
      if(servers[i] === getServerURL("Singapore")){
        promises.push(postNewSingaporeUser(servers[i], this.state.firstname, this.state.lastname, this.state.email, this.state.username, this.state.password, this.state.registrationKey));
      } else {
        promises.push(postNewUser(servers[i], this.state.firstname, this.state.lastname, this.state.email, this.state.username, this.state.password));
      }
    }

    var self = this;
    Promise.all(promises).then((result) => {
      var activeServerSet = false;
      var successfulSignUp = true;
      var serverTokenPair = [];

      for(var j = 0; j < result.length; j++){
          if(result[j][0].token !== undefined && !activeServerSet){
            serverTokenPair.push([result[j][1], result[j][0].token, "active"]);
            activeServerSet = true;
          } else if(result[j][0].token !== undefined && activeServerSet){
            serverTokenPair.push([result[j][1], result[j][0].token, "inactive"]);
          } else {
            var errorMessages = self.state.errorMessage;

            if(result[j][0].message){
              errorMessages.push(getServerName(result[j][1]) + ": " + result[j][0].message);
            } else if(result[j][0].error) {
              errorMessages.push(getServerName(result[j][1]) + ": " + result[j][0].error);
            } else if(result[j][0].errorCode) {
              errorMessages.push(getServerName(result[j][1]) + ": " + result[j][0].errorCode);
            } else {
              errorMessages.push(getServerName(result[j][1]) + ": " + result[j][0]);
            }

            self.setState({errorMessage: errorMessages});
            successfulSignUp = false;
          }
      }

      if(successfulSignUp){
        localStorage.setItem("Username", this.state.username);
        localStorage.setItem(this.state.username, JSON.stringify(serverTokenPair));
        self.props.history.push('/dashboard');
      } else {
        self.setState({showModal: true});
      }

    });

    return false;
  }

  openLoginForm = (event) => {
    this.props.setCurrentLoginForm("Login");
  }

  render() {
    let registrationKeyInput;
    if(this.state.singaporeSelected){
      registrationKeyInput = <div className = "login-input-wrapper"><i className="fas fa-lock"></i><input type="text" id="registrationKey" name="registrationKey" placeholder="Singapore Account Creation Key" required onChange={this.inputChangeHandler}></input></div>;
    } else {
      registrationKeyInput = null;
    }

    return(
      <div className = "row login-form-row">
        <div className = {"col-lg-8 col-md-10 col-sm-12 login-form-wrapper"}>
          <h1>knowledgeforum.org</h1>
          <form onSubmit={this.formSubmitHandler} className = "loginForm" id = "loginForm" autoComplete="on">

            <div className="login-input-wrapper signup-select-server">
              <i className="fas fa-server"></i>
              <div className="select-container">
                <Select
                  isMulti
                  options={SERVERS.map((s) => ({value: s.url, label: s.name}))}
                  onChange = {this.serverSelectHandler}
                  components={makeAnimated()}
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              </div>
              <div className="clearFix"></div>
            </div>

            <div className = "login-input-wrapper">
              <i className="fas fa-user"></i>
              <input type="text" id="firstname" name="firstname" placeholder="First Name" required onChange={this.inputChangeHandler}></input>
            </div>

            <div className = "login-input-wrapper">
              <i className="fas fa-user"></i>
              <input type="text" id="lastname" name="lastname" placeholder="Last Name" required onChange={this.inputChangeHandler}></input>
            </div>

            <div className = "login-input-wrapper">
              <i className="fas fa-envelope"></i>
              <input type="email" id="email" name="email" placeholder="Email" required onChange={this.inputChangeHandler}></input>
            </div>

            <div className = "login-input-wrapper">
              <i className="fas fa-user"></i>
              <input type="text" id="username" name="username" placeholder="Username" required onChange={this.inputChangeHandler}></input>
            </div>

            <div className = "login-input-wrapper">
              <i className="fas fa-lock"></i>
              <input type="password" id="password" name="password" placeholder="Password" required onChange={this.inputChangeHandler}></input>
            </div>

            <div className = "login-input-wrapper">
              <i className="fas fa-lock"></i>
              <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" required onChange={this.inputChangeHandler}></input>
            </div>

            {registrationKeyInput}

            <div>
              <p style={{display:'hidden',color:'red'}} id = "passwordError" name="passwordError">{this.state.passwordError}</p>
            </div>

            <input className = "login-button" type="submit" value="Create Account"></input>

            <Modal show={this.state.showModal} onHide={this.handleClose} centered>
              <Modal.Header closeButton>
                <Modal.Title>Server error(s) creating account:</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <ul>{this.state.errorMessage.map((s) => <li>{s}</li>)}</ul>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={this.handleClose}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>

          </form>

          <p className="login-create-account-p" onClick={this.openLoginForm}>Already have an account? Login <i className="far fa-arrow-alt-circle-right"></i></p>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
    setCurrentLoginForm
};

export default compose(
    withRouter,
    connect(null, mapDispatchToProps)
)(SignUpForm)
