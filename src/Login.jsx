import React, {Component} from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Modal, Button } from 'react-bootstrap';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import View from './components/View.js';
import $ from 'jquery';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import { setGlobalToken, setCurrentServer, setCommunityId, setViewId, fetchLoggedUser } from './store/globalsReducer.js';
import { setViewLinks, setBuildsOn, setReadLinks } from './store/noteReducer.js'
import { clearAuthors } from './store/userReducer.js';
import { setToken, setServer } from './store/api';
import { getUserToken } from './api/user.js';

import './css/Login.css';
import sample_view from './assets/sample_view.gif';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      demoUserName: "kfhowdemouser",
      demoUserPassword: "demouser123",
      demoServer: "https://kf6-stage.ikit.org/",
      demoCommunityId: "5ea995a6cbdc04a6f53a1b5c",
      demoCommunityTitle: "KF How To - KB Resources",
      demoViewId: "5ea995a7cbdc04a6f53a1b5f",
      modalContent: null,
      showModal: false,
    }

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleShow(){
    this.setState({showModal: true});
    var self = this;
    var demoTokenPromise = getUserToken(this.state.demoUserName, this.state.demoUserPassword, this.state.demoServer);
    demoTokenPromise.then(function(result) {
      var token = result.token;
      setServer(self.state.demoServer);
      setToken(token);
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('communityId', self.state.demoCommunityId);
      sessionStorage.setItem('viewId', self.state.demoViewId);
      self.props.setGlobalToken(token);
      self.props.fetchLoggedUser();
      self.props.setCommunityId(self.state.demoCommunityId);
      self.props.setViewId(self.state.demoViewId);
      self.props.setCurrentServer(self.state.demoServer);
      self.setState({
        modalContent: <View isDemo={true} demoCommunityTitle={self.state.demoCommunityTitle}></View>
      })
    });
  }

  handleClose(){
    // clear the redux store values from the demo
    this.props.setViewLinks([]);
    this.props.setBuildsOn([]);
    this.props.setReadLinks([]);
    this.props.clearAuthors([]);
    this.setState({
      showModal: false,
      modalContent: null,
    });
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
                    <Modal.Body className="login-modal-body" style={{padding: 0}}>
                      {this.state.modalContent}
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="primary" onClick={this.handleClose} className="login-modal-btn" style={{'background-color': '#2d5085'}}>
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

const mapDispatchToProps = {
    setGlobalToken,
    setCurrentServer,
    setCommunityId,
    setViewId,
    setViewLinks,
    setBuildsOn,
    setReadLinks,
    clearAuthors,
    fetchLoggedUser,
}

export default compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps)
)(Login)
