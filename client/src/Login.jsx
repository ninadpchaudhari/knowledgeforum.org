import React, {Component} from 'react';
import './css/index.css';
import {getUserToken} from './api/user.js';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uname: null,
      pwd: null,
      refreshCheckbox: null,
    }
  }

  inputChangeHandler = (event) => {
    let name = event.target.name;
    let val = event.target.value;

    this.setState({[name] : val});
  }

  formSubmitHandler = (event) => {
    event.preventDefault();
    var token = getUserToken(this.state.uname, this.state.pwd, "https://kf6-stage.ikit.org/");
    token.then((result) => {
      console.log(result);
      if(result.message){
        this.setState({response: result.message});
      } else if(result.token){
        this.setState({response: result.token});
      }

    });
  }

  render() {
    return(
      <div class = "col-md-6 login" id = "login">

        <div class = "row loginRow">
          <div class = "col-lg-8 col-md-10 col-sm-12 loginFormWrapper">
            <h1>knowledgeforum.org</h1>
            <form onSubmit={this.formSubmitHandler} class = "loginForm" id = "loginForm">

              <div class = "inputWrapper">
                <i class="fas fa-user"></i>
                <input type="text" id="uname" name="uname" placeholder="Username" required onChange={this.inputChangeHandler}></input>
              </div>

              <div class = "inputWrapper">
                <i class="fas fa-lock"></i>
                <input type="password" id="pwd" name="pwd" placeholder="Password" required onChange={this.inputChangeHandler}></input>
              </div>

              <div class = "checkBoxWrapper">
                <input type="checkbox" id="refreshCheckbox" name="refreshCheckbox"></input>
                <label for="refreshCheckbox">Refresh my servers on login?</label>
                <a id="popover" tabindex="0" role="button" data-toggle="popover"
                  data-trigger="hover" data-content="Check this box if you have registered to any new knowledge forums servers since your last login.">
                <i class="far fa-question-circle"></i></a>
              </div>

              <div>
                <p style={{display:'hidden',color:'red'}} id = "errorMessage" name="errorMessage"></p>
              </div>

              <input class = "button" type="submit" value="Login"></input>
            </form>
          </div>
        </div>

        <div>Server Response: {this.state.response}</div>
      </div>
    )
  }
}

export default Login;
