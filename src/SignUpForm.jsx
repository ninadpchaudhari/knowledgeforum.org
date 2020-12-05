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
      server: null,
      firstname: null,
      lastname: null,
      email: null,
      username: null,
      password: null,
      confirmPassword: null,
      registrationKey: null,
      errorMessage: null,
      singaporeSelected: false,
    }
  }

  inputChangeHandler = (event) => {
    let name = event.target.name;
    let val = event.target.value;

    this.setState({[name] : val});
  }

  serverSelectHandler = (event) => {
    event.value === getServerURL("Singapore") ? this.setState({singaporeSelected: true}) : this.setState({singaporeSelected: false});
    this.setState({server: event.value});
  }

  formSubmitHandler = (event) => {
    event.preventDefault();
    if(this.state.password !== this.state.confirmPassword){
      this.setState({errorMessage: "Passwords do not match."});
    } else {
      postNewUser(this.state.server, this.state.firstname, this.state.lastname, this.state.email, this.state.username, this.state.password, this.state.registrationKey).then((result) => {
        if(result[0] && result[0].token !== undefined) {
          localStorage.setItem("Username", this.state.username);
          localStorage.setItem(this.state.username, JSON.stringify([[result[1], result[0].token, "active"]]));
          this.props.history.push('/dashboard');
        } else {
          var resultErrorMessage = result[0].message || result[0].error || result[0].errorCode || result[0];
          this.setState({errorMessage: resultErrorMessage});
        }
      });
    }

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
                  options={SERVERS.map((s) => ({value: s.url, label: s.name}))}
                  onChange = {this.serverSelectHandler}
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
              <input type="text" id="username" name="username" placeholder="Username" minLength="3" maxLength="49" pattern="^[a-zA-Z][.0-9a-zA-Z@_-]{1,100}$" required onChange={this.inputChangeHandler}></input>
            </div>

            <div className = "login-input-wrapper">
              <i className="fas fa-lock"></i>
              <input type="password" id="password" name="password" placeholder="Password" minLength="4" required onChange={this.inputChangeHandler}></input>
            </div>

            <div className = "login-input-wrapper">
              <i className="fas fa-lock"></i>
              <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" required onChange={this.inputChangeHandler}></input>
            </div>

            {registrationKeyInput}

            <div>
              <p style={{color:'red'}} id = "errorMessage" name="errorMessage">{this.state.errorMessage}</p>
            </div>

            <input className = "login-button" type="submit" value="Create Account"></input>

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
