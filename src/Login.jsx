import React, {Component} from 'react';
import { Modal, Button } from 'react-bootstrap';
import Graph from './Graph';
import $ from 'jquery';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import {executePromises} from './helper/Login_helper.js';
import {getUserToken} from './api/user.js';

import './css/Login.css';
import sample_view from './assets/sample_view.gif';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uname: null,
      pwd: null,
      errorMessage: null,
      demoToken: null,
      demoServer: "https://kf6-stage.ikit.org/",
      demoCommunityId: "5ea995a6cbdc04a6f53a1b5c",
      demoViewId: "5ea995a7cbdc04a6f53a1b5f",
      showModal: false,
    }

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  inputChangeHandler = (event) => {
    let name = event.target.name;
    let val = event.target.value;

    this.setState({[name] : val});
  }

  formSubmitHandler = (event) => {
    event.preventDefault();
    var uname = document.getElementById("uname").value;
    var pwd = document.getElementById("pwd").value;
    document.getElementById("errorMessage").style.display = "hidden";
    executePromises(uname, pwd, this);
    return false;
  }

  handleShow(){
    this.setState({showModal: true});
  }

  handleClose(){
    this.setState({showModal: false});
  }

  componentDidMount(){
    // enables the popover for refreshing servers on login tool tip
    $('[data-toggle="tooltip"]').tooltip()
    $('[data-toggle="popover"]').popover()
    if($(window).width() <= 768) {
      document.getElementById("popover").setAttribute("data-trigger", "focus");
    }

    var ref = this;
    var demoTokenPromise = getUserToken("demo1", "demo1", this.state.demoServer);
    demoTokenPromise.then(function(result) {
      ref.setState({demoToken: result.token});
    });

  }

  render() {
    return(
      <div className='container-fluid login-main'>

        <div className = "row login-row">

            <div className = "col-md-6 login-col login" id = "login">

              <div className = "row login-form-row">
                <div className = {"col-lg-8 col-md-10 col-sm-12 login-form-wrapper"}>
                  <h1>knowledgeforum.org</h1>
                  <form onSubmit={this.formSubmitHandler} className = "loginForm" id = "loginForm">

                    <div className = "login-input-wrapper">
                      <i className="fas fa-user"></i>
                      <input type="text" id="uname" name="uname" placeholder="Username" required onChange={this.inputChangeHandler}></input>
                    </div>

                    <div className = "login-input-wrapper">
                      <i className="fas fa-lock"></i>
                      <input type="password" id="pwd" name="pwd" placeholder="Password" required onChange={this.inputChangeHandler}></input>
                    </div>

                    <div className = "login-checkbox-wrapper">
                      <input type="checkbox" id="refreshCheckbox" name="refreshCheckbox"></input>
                      <label htmlFor="refreshCheckbox">Refresh my servers on login?</label>
                      <span id="popover" tabIndex="0" role="button" data-toggle="popover"
                        data-trigger="hover" data-content="Check this box if you have registered to any new knowledge forums servers since your last login.">
                      <i className="far fa-question-circle"></i></span>
                    </div>

                    <div>
                      <p style={{display:'hidden',color:'red'}} id = "errorMessage" name="errorMessage">{this.state.errorMessage}</p>
                    </div>

                    <input className = "login-button" type="submit" value="Login"></input>

                  </form>
                </div>
              </div>
            </div>


            <div className = "col-md-6 login-about">

              <div className = "login-about-wrapper">
                <h1>What is knowledgeforum.org?</h1>
                <p>A knowledge forum is an electronic group workspace designed to support the process of knowledge building.
                    There are multiple installations of knowledge forums hosted by many universities and private entities all over the world.
                    Knowledgeforum.org unites all of these installations and hence the stakeholders to help confluence knowledge building research,
                    widen the reach of the tool & provide a central location for all global stakeholders.</p>

                  <div className="login-overlay-container login-demo-image" onClick={this.handleShow} id="demo-image-container">
                    <img className="d-block w-100" src={sample_view} alt={"First slide"}></img>
                    <div className="login-overlay">
                        <div className="login-overlay-text">Demo a Knowledge Forum</div>
                    </div>
                  </div>

                  <Modal show={this.state.showModal} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                      <Modal.Title>Knowledge Forum Demo</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Graph style={{width: '100%', height: '100%'}} token={this.state.demoToken} server={this.state.demoServer} communityId={this.state.demoCommunityId} viewId={this.state.demoViewId}/>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="primary" onClick={this.handleClose}>
                        Close
                      </Button>
                    </Modal.Footer>
                </Modal>

              </div>
            </div>


          </div>
      </div>
    )
  }
}

export default Login;
