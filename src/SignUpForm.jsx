import React, {Component} from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import {withRouter} from 'react-router';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { setCurrentLoginForm } from './store/globalsReducer.js'
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import {SERVERS} from './config.js';
import {postNewUser} from './api/user.js';

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
      errorMessage: null,
    }
  }

  inputChangeHandler = (event) => {
    let name = event.target.name;
    let val = event.target.value;

    this.setState({[name] : val});
  }

  serverSelectHandler = (event) => {
    if(event === null) {
      this.setState({servers: null});
    } else {
      var selected_Servers = [];
      for(var i = 0; i < event.length; i++){
        selected_Servers.push(event[i].value);
      }
      this.setState({servers: selected_Servers});
    }
  }

  formSubmitHandler = (event) => {
    event.preventDefault();
    if(this.state.password !== this.state.confirmPassword){
      this.setState({errorMessage: "Passwords do not match."});
      return false;
    }

    var servers = this.state.servers;
    var promises = [];

    for(var i = 0; i < servers.length; i++){
      promises.push(postNewUser(servers[i], this.state.firstname, this.state.lastname, this.state.email, this.state.username, this.state.password));
    }

    var self = this;
    Promise.all(promises).then((result) => {
      var successfulLogin = false;
      var serverTokenPair = [];

      for(var j = 0; j < result.length; j++){
          console.log(result[j][0].error);
          if(result[j][0].token !== undefined && !successfulLogin){
            serverTokenPair.push([result[j][1], result[j][0].token, "active"]);
            successfulLogin = true;
          } else if(result[j][0].token !== undefined && successfulLogin){
            serverTokenPair.push([result[j][1], result[j][0].token, "inactive"]);
          } else if(result[j][0].message !== undefined) {
            self.setState({errorMessage: result[j][0].message});
          } else if(result[j][0].error !== undefined && this.state.errorMessage === "") {
            self.setState({errorMessage: result[j][0].error});
          }
      }

      if(!successfulLogin){
        document.getElementById("errorMessage").style.display = "visible";
      } else {
        localStorage.setItem("Username", this.state.username);
        localStorage.setItem(this.state.username, JSON.stringify(serverTokenPair));
        self.props.history.push('/dashboard');
      }
    });

    return false;
  }

  openLoginForm = (event) => {
    this.props.setCurrentLoginForm("Login");
  }

  render() {
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

            <div>
              <p style={{display:'hidden',color:'red'}} id = "errorMessage" name="errorMessage">{this.state.errorMessage}</p>
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
