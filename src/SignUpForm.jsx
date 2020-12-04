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
      var errorMessages = [];
      var serverTokenPair = localStorage.getItem(this.state.username) || [];

      // if a server is successfull we add it to the users list in local storage for when we
      // redirect to the dashboard AND remove it from the list of selected servers in the case that
      // there is a failure with another server and the form needs to be resubmit (do not want to resubmit a server that was successful)

      // we add the result of every server into the error message to let the user decide whether to ignore the errors
      // or resubmit the form based on which servers failed

      // if ANY server has an error the error message will pop up
      for(var j = 0; j < result.length; j++){
          if(result[j][0].token !== undefined){

            if(!activeServerSet){
              serverTokenPair.push([result[j][1], result[j][0].token, "active"]);
              activeServerSet = true;
            } else {
              serverTokenPair.push([result[j][1], result[j][0].token, "inactive"]);
            }

            var selected_servers = this.state.servers;
            selected_servers = selected_servers.filter(s => s !== result[j][1]);
            this.setState({servers: selected_servers});

            errorMessages.push(<li className='signup-server-success'>{getServerName(result[j][1]) + ": Success "}<i className='far fa-check-square'></i></li>);
          } else {
            if(result[j][0].message){
              errorMessages.push(<li className='signup-server-failure'>{getServerName(result[j][1]) + ": " + result[j][0].message + " "}<i className='far fa-times-circle'></i></li>);
            } else if(result[j][0].error) {
              errorMessages.push(<li className='signup-server-failure'>{getServerName(result[j][1]) + ": " + result[j][0].error + " "}<i className='far fa-times-circle'></i></li>);
            } else if(result[j][0].errorCode) {
              errorMessages.push(<li className='signup-server-failure'>{getServerName(result[j][1]) + ": " + result[j][0].errorCode + " "}<i className='far fa-times-circle'></i></li>);
            } else {
              errorMessages.push(<li className='signup-server-failure'>{getServerName(result[j][1]) + ": " + result[j][0] + " "}<i className='far fa-times-circle'></i></li>);
            }

            successfulSignUp = false;
          }
      }

      localStorage.setItem("Username", this.state.username);
      localStorage.setItem(this.state.username, JSON.stringify(serverTokenPair));

      if(successfulSignUp){
        self.props.history.push('/dashboard');
      } else {
        self.setState({errorMessage: errorMessages});
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
                <Modal.Title>Account Creation Status:</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <ul>{this.state.errorMessage}</ul>
              </Modal.Body>
              <Modal.Footer>
                <Button className="signup-ignore-btn" variant="primary" onClick={() => {this.props.history.push('/dashboard')}}>
                  Ignore Error(s)
                </Button>
                <Button className="signup-resubmit-btn" variant="primary" onClick={this.handleClose}>
                  Resubmit Form
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
