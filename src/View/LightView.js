import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { DropdownButton, Dropdown, Button, Row, Col, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import Axios from 'axios';
import { apiUrl, getCommunity, putCommunity, postLink, getViews } from '../store/api.js';
import { newNote, openContribution, setCheckedNotes } from '../store/noteReducer.js'
import { connect } from 'react-redux'
import TopNavBar from '../TopNavBar/TopNavbar.js'
import DialogHandler from '../components/dialogHandler/DialogHandler.js'
import NoteContent from '../components/NoteContent/NoteContent'
import ScaffoldSelect from '../components/scaffold/ScaffoldSelect'
import ListOfNotes from './ListOfNotes/ListOfNotes'
import { fetchView, fetchCommunity, setCommunityId, setViewId, fetchViewCommunityData } from '../store/globalsReducer.js'
import { fetchAuthors } from '../store/userReducer.js'
import { Breakpoint } from 'react-socks'
import '../css/index.css';
import './View.css';

class View extends Component {

    //TOKEN
    token = sessionStorage.getItem('token');

    constructor(props) {
        super(props);

        this.state = {
            showView: false,
            addView: '',
            showRiseAbove: false,
            showModel: false,
            query: "",
            filteredData: [],
            filter: 'title',
            hideScaffold: true,
        };

        this.getBuildOnHierarchy = this.getBuildOnHierarchy.bind(this)
        this.handleSubmitView = this.handleSubmitView.bind(this);
        this.handleChangeView = this.handleChangeView.bind(this);
        this.onCloseDialog = this.onCloseDialog.bind(this);
        this.onConfirmDrawDialog = this.onConfirmDrawDialog.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.filterResults = this.filterResults.bind(this);
        this.getScaffoldSupports = this.getScaffoldSupports.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
        this.onScaffoldSelected = this.onScaffoldSelected.bind(this)
    }

    // GET BUILDON HIERARCHY
    getBuildOnHierarchy() {
        const hierarchy = {}
        for (let noteId in this.props.viewNotes) {
            hierarchy[noteId] = { children: {} }
        }
        this.props.buildsOn.forEach(note => {
            const parent = note.to
            const child = note.from
            if (!(parent in hierarchy))
                hierarchy[parent] = { children: {} }
            if (!(child in hierarchy))
                hierarchy[child] = { parent: parent, children: {} }
            else
                hierarchy[child]['parent'] = parent
            hierarchy[parent]['children'][child] = hierarchy[child]
        })
        const final_h = {}
        for (let [key, value] of Object.entries(hierarchy)) {
            if (!('parent' in value))
                final_h[key] = value
        }
        return final_h
    }

    // GET SCAFFOLD SUPPORTS
    getScaffoldSupports() {
        let supports = []
        this.props.scaffolds.forEach(scaffold => {
            supports = [...supports, ...scaffold.supports]
        })
        return supports
    }

    componentDidMount() {

    }


    componentDidUpdate(prevProps, prevState) {

    }

    // SET VALUES
    handleChangeView = (e) => {
        let target = e.target;
        let name = target.name;
        let value = target.value;

        this.setState({
            [name]: value
        });
    }

    // SUBMIT VIEW
    handleSubmitView(e) {
        e.preventDefault();
        var config = {
            headers: { Authorization: `Bearer ${this.token}` }
        };

        var addViewUrl = `${apiUrl}/contributions/${this.props.communityId}`;

        var query = {
            "authors": [this.props.author._id],
            "communityId": this.props.communityId,
            "permission": "public",
            "status": "active",
            "title": this.state.addView,
            "type": "View"
        }
        Axios.post(addViewUrl, query, config)
            .then(result => {
                //get new view Id
                let newViewId = result.data._id
                getCommunity(this.props.communityId).then(data => {
                    data.data.views.push(newViewId)
                    putCommunity(data.data, this.props.communityId).then(obj => {
                        getViews(this.props.communityId).then(viewsObj => {
                            let pos = {
                                x: 1000,
                                y: 1000
                            }
                            postLink(this.props.viewId, newViewId, 'contains', pos).then(linkObj => {
                                alert("View Added")
                                window.location.reload(false);
                            })
                        })
                    })
                }).catch(error => {
                    console.log(error);
                })
            }
            ).catch(
                error => {
                    console.log(error);

                }
            );
    }

    newView() {
        this.setState({
            showView: true,
            showModel: true,
        })
    }

    newRiseAbove() {
        this.setState({
            showView: false,
            showModel: true,
        })
    }

    //HANDLE MODEL
    handleShow(value) {
        this.setState({
            showModel: value,
        });

    }

    // FILTER RESULTS ON SCAFFOLD SELECT
    onScaffoldSelected = (support) => {
        this.setState({
            filteredData: this.filterResults(support.to)
        });
    }

    // CHANGE VIEW
    changeView(viewObj) {

        let viewId = viewObj.obj._id;
        this.props.history.push(`/view/${viewId}`);
        this.handleShow(false);
        window.location.reload();

    }

    onConfirmDrawDialog(drawing) {
        this.props.addDrawing(drawing);
        this.props.closeDrawDialog();
    }

    onCloseDialog(dlg) {
        this.props.removeNote(dlg.noteId);
        this.props.closeDialog(dlg.id);
    }

    filterResults(q) {
        const query = q || this.state.query
        let filteredResults = [];
        const notes = Object.values(this.props.viewNotes)
        if (query || this.state.filter) {
            switch (this.state.filter) {
                case "title":
                    filteredResults = notes.filter(note => note.title.toLowerCase().includes(query.toLowerCase()));
                    break;

                case "content":
                    filteredResults = notes.filter(function (obj) {
                        if (obj.data && obj.data.English) {
                            return obj.data.English.includes(query);
                        }
                        else if (obj.data && obj.data.body) {
                            return obj.data.body.includes(query);
                        }
                        return false
                    });

                    break;

                case "author":
                    const authors = [];
                    Object.values(this.props.authors).forEach(obj => {
                        const authName = `${obj.firstName} ${obj.lastName}`.toLowerCase()
                        if (authName.includes(query.toLowerCase())) {
                            authors.push(obj._id);
                        }
                    });
                    filteredResults = notes.filter(note => note.authors.some(author => authors.includes(author)))

                    break;
                case "scaffold":
                    const noteIds = this.props.supports.filter(support => support.from === query).map(support => support.to)
                    filteredResults = notes.filter(note => noteIds.includes(note._id))
                    break;

                default:
                    break;
            }
        }
        return filteredResults
    }
    handleInputChange = (event) => {
        const query = event.target.value
        this.setState({
            query: query,
            filteredData: this.filterResults(query)
        });
    };

    clearSearch() {
        this.setState({
            query: "",
            filteredData: this.filterResults(null),
        });
    };

    handleFilter = (e) => {
        let value = e.target.value;
        this.setState({
            filter: value,
            query: ''
        });
    }

    buildOn = (buildOn) => {
        this.props.newNote(this.props.view, this.props.communityId, this.props.author._id, buildOn);
    }


    render() {
        const showScffold = !this.hideScaffold && this.state.filter === "scaffold";
        const hierarchy = this.getBuildOnHierarchy()
        /* const filteredResults = this.filterResults() */
        let scaffolds;
        if (showScffold) {
            scaffolds = <ScaffoldSelect initVal={0} onScaffoldSelected={this.onScaffoldSelected} returnSupport={true} />
        }

        return (
            <>
                <DialogHandler />
                {/*<TopNavBar></TopNavBar>*/}
                <Breakpoint medium up>

                    <div className="row min-width">

                        {/* NOTES */}
                        <Col md="5" sm="12" className="mrg-1-top pd-2-right v-scroll">
                            <Form className="mrg-1-bot">
                                <Row>
                                    <Col>
                                        <InputGroup>
                                            <InputGroupAddon addonType="prepend">
                                                <Input type="select" name="filter" id="filter" onChange={this.handleFilter}>
                                                    <option key="title" value="title">Search By Title</option>
                                                    <option key="scaffold" value="scaffold">Search By Scaffold</option>
                                                    <option key="content" value="content">Search By Content</option>
                                                    <option key="author" value="author">Search By Author</option>
                                                </Input>
                                            </InputGroupAddon>
                                            <Input
                                                className="form-control"
                                                value={this.state.query}
                                                placeholder="Search Your Note"
                                                onChange={this.handleInputChange}
                                            />

                                            <InputGroupAddon addonType="append">
                                                <InputGroupText>
                                                    <i className="fa fa-search"></i>
                                                </InputGroupText>
                                            </InputGroupAddon>

                                            <InputGroupAddon addonType="append">
                                                <InputGroupText style={{ cursor: "pointer" }} onClick={this.clearSearch} >
                                                    <i className="fa fa-refresh"></i>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </Col>
                                </Row>
                            </Form>
                            {scaffolds}
                            {this.state.query === "" && !showScffold ?
                                (<ListOfNotes hierarchy={hierarchy} />)
                                :
                                (<ListOfNotes noteLinks={this.state.filteredData} />)
                            }
                        </Col>

                        {/* NOTE CONTENT */}
                        {this.props.checkedNotes.length ?
                            (<>
                                <Col md="5" sm="12" className="mrg-6-top v-scroll">
                                    <NoteContent query={this.state.query} buildOn={this.buildOn} />
                                </Col>
                            </>)
                            : null
                        }

                    </div>



                </Breakpoint>

                <Breakpoint small down>

                    <div className="row min-width">

                        {/* NOTES */}
                        <Col md="5" sm="12" className="mrg-05-top pd-2-right primary-bg-50">
                            <Form className="mrg-1-bot">
                                <Row>
                                    <Col>
                                        <InputGroup>
                                            <InputGroupAddon addonType="prepend">
                                                <Input type="select" name="filter" id="filter" onChange={this.handleFilter}>
                                                    <option key="title" value="title">Search By Title</option>
                                                    <option key="scaffold" value="scaffold">Search By Scaffold</option>
                                                    <option key="content" value="content">Search By Content</option>
                                                    <option key="author" value="author">Search By Author</option>
                                                </Input>
                                            </InputGroupAddon>
                                            <Input
                                                className="form-control"
                                                value={this.state.query}
                                                placeholder="Search Your Note"
                                                onChange={this.handleInputChange}
                                            />

                                            <InputGroupAddon addonType="append">
                                                <InputGroupText>
                                                    <i className="fa fa-search"></i>
                                                </InputGroupText>
                                            </InputGroupAddon>

                                            <InputGroupAddon addonType="append">
                                                <InputGroupText style={{ cursor: "pointer" }} onClick={this.clearSearch} >
                                                    <i className="fa fa-refresh"></i>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </Col>
                                </Row>
                            </Form>
                            {scaffolds}
                            {this.state.query === "" && !showScffold ?
                                (<ListOfNotes hierarchy={hierarchy} />)
                                :
                                (<ListOfNotes noteLinks={this.state.filteredData} />)
                            }
                        </Col>
                    </div>



                </Breakpoint>

                {/* MODEL */}
                <Modal show={this.state.showModel} onHide={() => this.handleShow(false)}>

                    {this.state.showView ? (
                        <>
                            <Modal.Header closeButton>
                                <Modal.Title>
                                    <Row>
                                        <Col>Views</Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Row>
                                                <Form onSubmit={this.handleSubmitView} className="form">
                                                    <Col>
                                                        <FormGroup>
                                                            <Label htmlFor="addView" style={{ fontSize: "1rem" }}>Add View</Label>
                                                            <Input type="text" id="addView" placeholder="Enter View Name" name="addView" value={this.state.addView} onChange={this.handleChangeView} />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col>
                                                        <Button varient="secondary" onClick={this.handleSubmitView}>Add</Button>
                                                    </Col>
                                                </Form>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{ 'max-height': 'calc(100vh - 210px)', 'overflow-y': 'auto' }}>
                                {this.props.myViews.map((obj, i) => {
                                    return <Row key={i} value={obj.title} className="mrg-05-top">
                                        <Col><Link onClick={() => this.changeView({ obj })}> {obj.title} </Link></Col>
                                    </Row>
                                })}
                            </Modal.Body>
                        </>) : null}

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.handleShow(false)}>
                            Close
                    </Button>
                    </Modal.Footer>
                </Modal>

            </>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        communityId: state.globals.communityId,
        viewId: state.globals.viewId,
        view: state.globals.view,
        author: state.globals.author,
        noteContent: state.globals.noteContent,
        communities: state.globals.communities,
        myViews: state.globals.views,
        authors: state.users,
        scaffolds: state.scaffolds.items,
        viewNotes: state.notes.viewNotes,
        checkedNotes: state.notes.checkedNotes,
        viewLinks: state.notes.viewLinks,
        buildsOn: state.notes.buildsOn,
        supports: state.notes.supports,
        riseAboveViewNotes: state.notes.riseAboveViewNotes
    }
}

const mapDispatchToProps = {
    fetchView,
    fetchCommunity,
    fetchAuthors,
    setCommunityId,
    setViewId,
    setCheckedNotes,
    newNote,
    openContribution,
    fetchViewCommunityData
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(View)
