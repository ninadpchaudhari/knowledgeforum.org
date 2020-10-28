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
      <div className="container-fluid main">

        <div className = "row">

            <div className = "col-md-6 login" id = "login">

              <div className = "row loginRow">
                <div className = "col-lg-8 col-md-10 col-sm-12 loginFormWrapper">
                  <h1>knowledgeforum.org</h1>
                  <form onSubmit={this.formSubmitHandler} className = "loginForm" id = "loginForm">

                    <div className = "inputWrapper">
                      <i className="fas fa-user"></i>
                      <input type="text" id="uname" name="uname" placeholder="Username" required onChange={this.inputChangeHandler}></input>
                    </div>

                    <div className = "inputWrapper">
                      <i className="fas fa-lock"></i>
                      <input type="password" id="pwd" name="pwd" placeholder="Password" required onChange={this.inputChangeHandler}></input>
                    </div>

                    <div className = "checkBoxWrapper">
                      <input type="checkbox" id="refreshCheckbox" name="refreshCheckbox"></input>
                      <label for="refreshCheckbox">Refresh my servers on login?</label>
                      <a id="popover" tabindex="0" role="button" data-toggle="popover"
                        data-trigger="hover" data-content="Check this box if you have registered to any new knowledge forums servers since your last login.">
                      <i className="far fa-question-circle"></i></a>
                    </div>

                    <div>
                      <p style={{display:'hidden',color:'red'}} id = "errorMessage" name="errorMessage"></p>
                    </div>

                    <input className = "button" type="submit" value="Login"></input>
                  </form>
                </div>
              </div>

              <div>Server Response: {this.state.response}</div>
            </div>


            <div className = "col-md-6 about">

              <div className = "aboutWrapper">
                <h1>What is knowledgeforum.org?</h1>
                <p>A knowledge forum is an electronic group workspace designed to support the process of knowledge building.
                    There are multiple installations of knowledge forums hosted by many universities and private entities all over the world.
                    Knowledgeforum.org unites all of these installations and hence the stakeholders to help confluence knowledge building research,
                    widen the reach of the tool & provide a central location for all global stakeholders.</p>

                  <div className="overlay-container demo-image" data-toggle="modal" data-target="#exampleModal" id="demo-image-container">
                    <img className="d-block w-100" src={"http://localhost:3000/assets/sample_view.gif"} alt={"First slide"}></img>
                    <div className="overlay">
                        <div className="overlay-text">Demo a Knowledge Forum</div>
                    </div>
                  </div>

                  <div className="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title" id="exampleModalLabel">Knowledge Forum Demo</h5>
                          <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                          </button>
                        </div>
                        <div className="modal-body">
                          <iframe id="iframeDemo" title="Knowledge Forum Demo"></iframe>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="button modal-btn" data-dismiss="modal">Close</button>
                        </div>
                      </div>
                    </div>
                  </div>

              </div>
            </div>


          </div>
      </div>
    )
  }
}

export default Login;
