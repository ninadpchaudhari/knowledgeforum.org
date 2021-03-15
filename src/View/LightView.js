import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Form, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { newNote } from '../store/noteReducer.js'
import { connect } from 'react-redux'
import DialogHandler from '../components/dialogHandler/DialogHandler.js'
import NoteContent from '../components/NoteContent/NoteContent'
import ScaffoldSelect from '../components/scaffold/ScaffoldSelect'
import ListOfNotes from './ListOfNotes/ListOfNotes'
import { Breakpoint } from 'react-socks'
import '../css/index.css';
import './View.css';

class View extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showView: false,
            showRiseAbove: false,
            query: "",
            filteredData: [],
            filter: 'title',
            hideScaffold: true,
        };

        this.getBuildOnHierarchy = this.getBuildOnHierarchy.bind(this)
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

    newRiseAbove() {
        this.setState({
            showView: false,
            showModel: true,
        })
    }

    // FILTER RESULTS ON SCAFFOLD SELECT
    onScaffoldSelected = (support) => {
        this.setState({
            filteredData: this.filterResults(support.to)
        });
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
                                <Col md="5" sm="12" className="mrg-1-top v-scroll">
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
    newNote
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(View)
