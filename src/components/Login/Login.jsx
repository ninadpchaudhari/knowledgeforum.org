import React, {Component} from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Modal, Button } from 'react-bootstrap';
import LoginForm from './LoginForm.jsx';
import SignUpForm from './SignUpForm.jsx';
import View from '../CommunityView/View.js';
import $ from 'jquery';
import '../../../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import { setDemoStatus, setGlobalToken, setCurrentServer, setCommunityId, setViewId, fetchLoggedUser } from '../../store/globalsReducer.js';
import { setViewLinks, setBuildsOn, setReadLinks } from '../../store/noteReducer.js'
import { clearAuthors } from '../../store/userReducer.js';
import { setToken, setServer } from '../../store/api';
import { getUserToken } from './../../legacy_api/user.js';
import { DEMOUSERNAME, DEMOUSERPASSWORD, DEMOSERVER, DEMOCOMMUNITYID, DEMOCOMMUNITYTITLE, DEMOVIEWID } from '../../config.js';

import './Login.css';
import sample_view from './../../assets/sample_view.gif';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      demoUserName: DEMOUSERNAME,
      demoUserPassword: DEMOUSERPASSWORD,
      demoServer: DEMOSERVER,
      demoCommunityId: DEMOCOMMUNITYID,
      demoCommunityTitle: DEMOCOMMUNITYTITLE,
      demoViewId: DEMOVIEWID,
      modalContent: null,
      showModal: false,
      modalDialogClassName: "login-modal-dialog",
    }

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.toggleFullScreenModal = this.toggleFullScreenModal.bind(this);
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
      self.props.setDemoStatus(true);
      self.props.setGlobalToken(token);
      self.props.fetchLoggedUser();
      self.props.setCommunityId(self.state.demoCommunityId);
      self.props.setViewId(self.state.demoViewId);
      self.props.setCurrentServer(self.state.demoServer);
      self.setState({
        modalContent: <View demoCommunityTitle={self.state.demoCommunityTitle}></View>
      })
    });
  }

  handleClose(){
    // clear the redux store values from the demo
    this.props.setDemoStatus(false);
    this.props.setViewLinks([]);
    this.props.setBuildsOn([]);
    this.props.setReadLinks([]);
    this.props.clearAuthors([]);
    this.setState({
      showModal: false,
      modalContent: null,
      modalDialogClassName: "login-modal-dialog",
    });
  }

  toggleFullScreenModal(){
    var newClass = "";
    if(this.state.modalDialogClassName === "login-modal-dialog"){ newClass = "login-modal-dialogfullscreen"; }
    else if(this.state.modalDialogClassName === "login-modal-dialogfullscreen"){ newClass = "login-modal-dialog"; }
    this.setState({modalDialogClassName: newClass});
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

                  <Modal dialogClassName={this.state.modalDialogClassName} show={this.state.showModal} onHide={this.handleClose}>
                    <Modal.Header>
                      <Modal.Title className="login-modal-title">
                          Knowledge Forum Demo
                          <a className="kf-demo-modaltitle-btn" onClick={this.handleClose}><i className="fas fa-times"></i></a>
                          <a className="kf-demo-modaltitle-btn" onClick={this.toggleFullScreenModal}><i className="fas fa-expand-alt"></i></a>
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="login-modal-body" style={{padding: 0}}>
                      {this.state.modalContent}
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="primary" onClick={this.handleClose} className="login-modal-btn" style={{'backgroundColor': '#2d5085'}}>
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
    setDemoStatus,
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
