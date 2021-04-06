import React, { Component } from 'react'
import { Navbar, Nav, Button } from 'react-bootstrap'
import { Row, Col, Form, FormGroup, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { removeToken } from '../store/api.js'
import { setViewId, setGlobalToken, setSearchQuery, setSearchFilter } from '../store/globalsReducer'

class TopNavbar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: '',
    }

    this.handleChange = this.handleChange.bind(this);
  }

  handleFilter = (e) => {
      let value = e.target.value;
      this.setState({query: ''});
      this.props.setSearchQuery('');
      this.props.setSearchFilter(value);
  }

  handleInputChange = (event) => {
      const query = event.target.value
      this.setState({query: query});
      if(query === '') this.props.setSearchQuery('');
  };

  handleSearchSubmit = (e) => {
    this.props.setSearchQuery(this.state.query);
    e.preventDefault();
  }

  logout() {
    sessionStorage.clear();
    removeToken()//remove token from api header
    setGlobalToken(null)//Remove token from store
  }

  handleChange(e) {
    const viewId = e.target.value;
    this.props.onViewClick(viewId);
  }

  signUp = (e) => {
    this.props.history.push("/");
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.currentView !== prevProps.currentView){
      this.setState({query: ''});
    }
  }


  render() {
    const isLoggedIn = this.props.isAuthenticated
    const userName = this.props.user ? `${this.props.user.firstName} ${this.props.user.lastName}` : null
    const isViewUrl = this.props.location.pathname.startsWith('/view/')
    return (
      <Navbar className="viewNavBar">
        <Navbar.Brand className="viewNavBar-brand d-none d-sm-block">{this.props.communityTitle}</Navbar.Brand>

        <Navbar.Text className="viewNavBar-dropdown-title">View:</Navbar.Text>
        {isViewUrl ?
          (
            <Nav className="viewNavBar-dropdown">
              {this.props.view ?
                <Form>
                    <FormGroup className="viewNavBar-dropdown-formgroup">
                      <Input type="select" name="viewId" value={this.props.view._id} onChange={this.handleChange}>
                        {
                          this.props.views.map((obj) => {
                            return <option key={obj._id} value={obj._id}> {obj.title} </option>
                          })
                        }
                      </Input>
                    </FormGroup>
                </Form>
                : null}
            </Nav>
          )
          : null}

          <Navbar.Text className="viewNavBar-dropdown-title">Search:</Navbar.Text>
          <Form onSubmit={this.handleSearchSubmit}>
              <Row>
                  <Col>
                      <InputGroup>
                          <InputGroupAddon addonType="prepend">
                              <Input type="select" name="filter" id="filter" onChange={this.handleFilter}>
                                  <option key="title" value="title">Title</option>
                                  <option key="scaffold" value="scaffold">Scaffold</option>
                                  <option key="content" value="content">Content</option>
                                  <option key="author" value="author">Author</option>
                              </Input>
                          </InputGroupAddon>
                          <Input
                              className="form-control"
                              value={this.state.query}
                              placeholder="Search"
                              onChange={this.handleInputChange}
                          />

                          {<InputGroupAddon addonType="append">
                              <InputGroupText style={{ cursor: "pointer" }} onClick={this.handleSearchSubmit}>
                                  <i className="fa fa-search"></i>
                              </InputGroupText>
                          </InputGroupAddon>}
                      </InputGroup>
                  </Col>
              </Row>
          </Form>

        {isLoggedIn ? (
          <>
            <Nav className="ml-auto">
              <Nav.Link className="white mr-auto d-none d-sm-block"> {userName} </Nav.Link>
              <Button className='ml-2 viewNavBar-logout-btn' href="/" onClick={this.logout}>Logout</Button>
            </Nav>
          </>
        ) :
          <>
            <Nav className="ml-auto">
              <Nav.Link onClick={this.signUp}>Signup</Nav.Link>
              <Nav.Link href="/">Login</Nav.Link>
            </Nav>
          </>
        }

      </Navbar>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    communityId: state.globals.communityId,
    viewId: state.globals.viewId,
    isAuthenticated: state.globals.isAuthenticated,
    user: state.globals.author,
    views: state.globals.views,
    view: state.globals.view,
    viewNotes: state.notes.viewNotes,
    authors: state.users,
    supports: state.notes.supports,
    query: state.globals.searchQuery,
    filter: state.globals.searchFilter
  }
}
const mapDispatchToProps = {
  setViewId,
  setGlobalToken,
  setSearchQuery,
  setSearchFilter
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(TopNavbar));
