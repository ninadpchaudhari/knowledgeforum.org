import React, {Component} from 'react';
import {withRouter} from 'react-router';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Modal, Button } from 'react-bootstrap';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import Graph from './Graph';
import $ from 'jquery';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import {getUserToken} from './api/user.js';

import './css/Login.css';
import sample_view from './assets/sample_view.gif';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      demoToken: null,
      demoServer: "https://kf6-stage.ikit.org/",
      demoCommunityId: "5ea995a6cbdc04a6f53a1b5c",
      demoViewId: "5ea995a7cbdc04a6f53a1b5f",
      showModal: false,
    }

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleShow(){
    this.setState({showModal: true});
    var ref = this;
    var demoTokenPromise = getUserToken("demo1", "demo1", this.state.demoServer);
    demoTokenPromise.then(function(result) {
      ref.setState({demoToken: result.token});
    });
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
  }

  render() {
    let formToRender;
    if(this.props.currentLoginForm === "Login"){
      formToRender = <LoginForm></LoginForm>;
    } else if(this.props.currentLoginForm === "SignUp"){
      formToRender = <SignUpForm></SignUpForm>;
    }

    return(
      <div className='container-fluid login-main'>

        <div className = "row login-row">

            <div className = "col-md-6 login-col login" id = "login">
              {formToRender}
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

                  <Modal dialogClassName="login-modal-dialog" show={this.state.showModal} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                      <Modal.Title>Knowledge Forum Demo</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="login-modal-body">
                      <Graph style={{width: '100%', height: '100%'}} token={this.state.demoToken} server={this.state.demoServer} communityId={this.state.demoCommunityId} viewId={this.state.demoViewId}/>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="primary" onClick={this.handleClose} className="login-modal-btn">
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

const mapStateToProps = (state, ownProps) => {
    return {
        currentLoginForm: state.globals.currentLoginForm,
    }
}

export default compose(
    withRouter,
    connect(mapStateToProps, null)
)(Login)
