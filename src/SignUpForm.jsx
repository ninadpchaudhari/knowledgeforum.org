import React, {Component} from 'react';
import Select from 'react-select';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { compose } from 'redux';
import ReCAPTCHA from 'react-google-recaptcha';
import { setCurrentLoginForm, setGlobalToken } from './store/globalsReducer.js'
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import {SERVERS, getServerURL, siteKey} from './config.js';
import {postNewUser} from './api/user.js';

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
      recaptchaVerified: false,
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
    if(this.state.server === null) {
      this.setState({errorMessage: "Please select a server."});
    } else if(/^[a-zA-Z][.0-9a-zA-Z@_-]{1,100}$/.test(this.state.username) === false) {
      this.setState({errorMessage: ["Username must meet the following requirements:", <br />, "1. Start with a letter", <br />,
      "2. Not contain any white spaces", <br />, "3. Can only contain the special characters @._-"]});
    } else if(this.state.password !== this.state.confirmPassword){
      this.setState({errorMessage: "Passwords do not match."});
    } else {
      postNewUser(this.state.server, this.state.firstname, this.state.lastname, this.state.email, this.state.username, this.state.password, this.state.registrationKey).then((result) => {
        if(result[0] && result[0].token !== undefined) {
          localStorage.setItem("Username", this.state.username);
          localStorage.setItem(this.state.username, JSON.stringify([[result[1], result[0].token, "active"]]));
          this.props.setGlobalToken(result[0].token);
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

  verifyRecaptcha = (event) => {
    event === null ? this.setState({recaptchaVerified: false}) : this.setState({recaptchaVerified: true})
  }

  render() {
    let userAuthenticationMethod;
    if(this.state.singaporeSelected){
      userAuthenticationMethod = <div className = "login-input-wrapper"><i className="fas fa-lock"></i><input type="text" id="registrationKey" name="registrationKey" placeholder="Singapore Account Creation Key" required onChange={this.inputChangeHandler}></input></div>;
    } else {
      userAuthenticationMethod = <ReCAPTCHA sitekey={siteKey} onChange={this.verifyRecaptcha}/>;
    }

    let signUpButton;
    if((this.state.recaptchaVerified === true && !this.state.singaporeSelected) || (this.state.singaporeSelected && this.state.registrationKey !== null)){
      signUpButton = <input className = "login-button" type="submit" value="Create Account"></input>;
    } else {
      signUpButton = <input className = "login-button login-disabled" type="submit" value="Create Account" disabled></input>;
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
                  placeholder={"Select a Server"}
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
              <input type="text" id="username" name="username" placeholder="Username" minLength="3" maxLength="49" required onChange={this.inputChangeHandler}></input>
            </div>

            <div className = "login-input-wrapper">
              <i className="fas fa-lock"></i>
              <input type="password" id="password" name="password" placeholder="Password" minLength="4" required onChange={this.inputChangeHandler}></input>
            </div>

            <div className = "login-input-wrapper">
              <i className="fas fa-lock"></i>
              <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" required onChange={this.inputChangeHandler}></input>
            </div>

            {userAuthenticationMethod}

            <div>
              <p style={{color:'red'}} id = "errorMessage" name="errorMessage">{this.state.errorMessage}</p>
            </div>

            {signUpButton}

          </form>

          <p className="login-create-account-p" onClick={this.openLoginForm}>Already have an account? Login <i className="far fa-arrow-alt-circle-right"></i></p>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
    setGlobalToken,
    setCurrentLoginForm
};

export default compose(
    withRouter,
    connect(null, mapDispatchToProps)
)(SignUpForm)
