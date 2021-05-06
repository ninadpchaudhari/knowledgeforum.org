import React, { Component } from 'react'
import { Navbar, Nav, Button } from 'react-bootstrap'
import { Row, Col, Form, FormGroup, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { removeToken } from '../../store/api.js'
import { setViewId, setGlobalToken, setSearchQuery, setSearchFilter } from '../../store/globalsReducer'

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
      var query;
      if(value === "scaffold"){
        query = this.props.scaffolds[0].supports[0].to;
      } else if(value === "author"){
        query = this.props.user.firstName + " " + this.props.user.lastName;
      } else {
        query = '';
      }
      this.setState({query: query});
      this.props.setSearchQuery(query);
      this.props.setSearchFilter(value);
  }

  handleInputChange = (event) => {
      const query = event.target.value
      this.setState({query: query});
      if(query === '' || this.props.filter === 'scaffold' || this.props.filter === "author") this.props.setSearchQuery(query);
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
    if(this.props.currentView !== prevProps.currentView || this.props.viewId !== prevProps.viewId){
      this.setState({query: ''});
      this.props.setSearchQuery('');
      this.props.setSearchFilter('title');
      document.getElementById('queryForm').reset();
    }
  }

  render() {
    const userName = this.props.user ? `${this.props.user.firstName} ${this.props.user.lastName}` : null

    var searchInput;
    if(this.props.filter === "scaffold"){
      searchInput = <Input type="select" onChange={this.handleInputChange}>
                        {this.props.scaffolds.map((scaffold, i) => {
                          return <optgroup key={i} label={scaffold.title}>
                              {scaffold.supports.map((support, j) => {
                                  return <option key={j} value={support.to}>{support._to.title}</option>;
                              })}
                          </optgroup>;
                        })}
                    </Input>;
    } else if(this.props.filter === "author"){
      searchInput = <Input type="select" onChange={this.handleInputChange} defaultValue={this.props.user.firstName + " " + this.props.user.lastName}>
                        {Object.values(this.props.authors).sort((a, b) => {
                          var aName = (a.firstName + " " + a.lastName).toLowerCase();
                          var bName = (b.firstName + " " + b.lastName).toLowerCase();
                          if(aName < bName) return -1;
                          if(aName > bName) return 1;
                          return 0;
                         }).map((author, i) => {
                          var name = author.firstName + " " + author.lastName;
                          return <option key={i} value={name}>{name}</option>;
                         })
                        }
                    </Input>;
    } else {
      searchInput = <Input
          className="form-control"
          value={this.state.query}
          placeholder="Search"
          onChange={this.handleInputChange}
      />;
    }

    return (
      <Navbar className="viewNavBar">
        {this.props.isDemo === false ? (
          <Button className='mr-2 viewNavBar-logout-btn' onClick={this.props.goToDashboard}><i className="fas fa-home"></i></Button>
        ) : null}
        <Navbar.Brand className="viewNavBar-brand d-none d-sm-block">{this.props.communityTitle}</Navbar.Brand>

        <Navbar.Text className="viewNavBar-dropdown-title">View:</Navbar.Text>
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

          <Navbar.Text className="viewNavBar-dropdown-title">Search:</Navbar.Text>
          <Form id={"queryForm"} onSubmit={this.handleSearchSubmit}>
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
                          {searchInput}

                          {<InputGroupAddon addonType="append">
                              <InputGroupText style={{ cursor: "pointer" }} onClick={this.handleSearchSubmit}>
                                  <i className="fa fa-search"></i>
                              </InputGroupText>
                          </InputGroupAddon>}
                      </InputGroup>
                  </Col>
              </Row>
          </Form>

          <Nav className="ml-auto">
            <Nav.Link className="white mr-auto d-none d-sm-block"> {userName} </Nav.Link>
            {this.props.isDemo === false ? (
              <Button className='ml-2 viewNavBar-logout-btn' href="/" onClick={this.logout}>Logout</Button>
            ) : null}
         </Nav>

      </Navbar>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    isDemo: state.globals.isDemo,
    communityId: state.globals.communityId,
    viewId: state.globals.viewId,
    user: state.globals.author,
    views: state.globals.views,
    view: state.globals.view,
    scaffolds: state.scaffolds.items,
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
