import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, } from 'react-bootstrap';
import { Form, FormGroup, Input, Alert } from 'reactstrap';
import { dateFormatOptions } from '../../store/globalsReducer'
import Axios from 'axios';

import './NoteContent.css';
import { url, apiUrl } from '../../store/api.js'
import * as access from '../../store/access'
import { openContribution, updateCheckedNotes } from '../../store/noteReducer'
import { fetchViewCommunityData } from '../../store/globalsReducer'
import { createRiseAbove } from '../../store/riseAboveReducer'

class NoteContent extends Component {
    noteList = [];
    constructor(props) {
        super(props);
        this.state = {
            token: sessionStorage.getItem('token'),
            addView: this.props.viewId,
            communityId: sessionStorage.getItem('communityId'),
            visible: false,
            viewError: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.handleRiseAbove = this.handleRiseAbove.bind(this);
        this.getRiseAboveNotes = this.getRiseAboveNotes.bind(this);
        this.openNote = this.openNote.bind(this);
        this.editNote = this.editNote.bind(this);

    }

    componentDidMount() {
    }

    handleChange(e) {
        e.persist();
        let target = e.target;
        let id = target.value;

        this.setState({
            addView: id,
        });

    }

    // CREATE VIEW->NOTE LINK
    handleSubmit = (e) => {
        if (this.props.viewId === this.state.addView) {
            this.setState({
                viewError: true,
            })
            window.setTimeout(() => {
                this.setState({ viewError: false })
            }, 1500)
        }
        else {
            const topleft = { x: 1000, y: 1000 };
            let url = `${apiUrl}/links`;
            let config = {
                headers: { Authorization: `Bearer ${this.state.token}` }
            };
            this.props.checkedNotes.forEach(note => {
                const ref = this.props.viewLinks.filter((lnk) => lnk.to === note._id)[0]
                topleft.x = Math.min(topleft.x, ref.data.x);
                topleft.y = Math.min(topleft.y, ref.data.y);
            })
            this.props.checkedNotes.forEach(note => {
                let noteId = note._id;
                let query = {
                    "from": this.state.addView,
                    "to": noteId,
                    "type": "contains",
                    'data': topleft
                };
                Axios.post(url, query, config).then(
                    res => {
                        this.setState({ visible: true }, () => {
                            window.setTimeout(() => {
                                this.setState({ visible: false })
                            }, 1000)
                        });

                    }
                );
            });
        }
        // TODO POST LINKS ALERT THEY'RE ADDED TO VIEW TITLE

    }

    handleRiseAbove = async (e) => {
        let noOfNotes = this.props.checkedNotes.length;
        //IF CHECKED NOTES
        if (noOfNotes > 0) {
            let confirmation = window.confirm("Are you sure to create riseabove using the selected " + noOfNotes + " object(s)?");
            if (!confirmation) {
                return;
            }
            //CREATE RISEABOVE
            let view = this.props.view;
            let communityId = this.props.communityId;
            let author = this.props.author._id;
            let notes = this.props.checkedNotes;
            await this.props.createRiseAbove(view, communityId, author, notes);
            this.props.fetchViewCommunityData(this.props.viewId)


        } else {
            alert("Please select at least 1 note to create RiseAbove");
        }
    }

    editNote = (contribId, mode) => {
        this.props.openContribution(contribId, mode);
    }

    getRiseAboveNotes = (riseAboveId) => {
        if (this.props.riseAboveViewNotes[riseAboveId]) {
            let riseAboveNotes = this.props.riseAboveViewNotes[riseAboveId].map((noteId) => this.props.riseAboveNotes[noteId])
            return riseAboveNotes;
        }
        return null;
    }

    openNote = (noteId) => {
        this.props.openContribution(noteId, "read")
    }

    render() {
        const formatter = new Intl.DateTimeFormat('default', dateFormatOptions)
        return (
            <>
                <Form className="mrg-1-top">
                    <Row>
                        <Col md="6">
                            <FormGroup>
                                <Input type="select" name="viewId" onChange={this.handleChange}>{
                                    this.props.views.map((obj, i) => {
                                        return <option key={i} value={obj._id}> {obj.title} </option>
                                    })
                                }</Input>
                            </FormGroup>
                        </Col>

                        <Col md="3">
                            <Button onClick={this.handleSubmit} >Add to View</Button>
                        </Col>

                        <Col md="3">
                            <Button onClick={this.handleRiseAbove} >create RiseAbove</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Alert color="danger" isOpen={this.state.viewError} >
                                Please select a Different View.
                            </Alert>
                            <Alert color="info" isOpen={this.state.visible} >
                                Notes added to View!
                            </Alert>
                        </Col>
                    </Row>
                </Form>
                {this.props.checkedNotes.map(
                    (obj, i) => {
                        let riseAboveNotes = this.getRiseAboveNotes(obj._id);
                        let RiseAboveNotes;
                        if (riseAboveNotes) {
                            RiseAboveNotes = <Row>
                                <Col className="pd-1-left">
                                    <Row className="sz-1 primary-800 font-weight-bold" >RiseAbove Notes</Row>
                                    {riseAboveNotes.map((note, i) => {
                                        return <Row key={i}>
                                            <Button variant="light" className="min-width-10 rounded-pill pd-05" onClick={() => this.openNote(note._id)}>{note.title}</Button>
                                        </Row>
                                    })}
                                </Col>
                            </Row>
                        }
                        let data;
                        if (this.props.query && obj.data.English) {
                            let innerHTML = obj.data.English;
                            let index = innerHTML.indexOf(this.props.query);
                            if (index >= 0) {
                                data = innerHTML.substring(0, index) + "<span class='highlight'>" + innerHTML.substring(index, index + this.props.query.length) + "</span>" + innerHTML.substring(index + this.props.query.length);
                            }
                        } else if (this.props.query && obj.data.body) {
                            let innerHTML = obj.data.body;
                            let index = innerHTML.indexOf(this.props.query);
                            if (index >= 0) {
                                data = innerHTML.substring(0, index) + "<span class='highlight'>" + innerHTML.substring(index, index + this.props.query.length) + "</span>" + innerHTML.substring(index + this.props.query.length);
                            }
                        } else {
                            data = obj.data.English ? obj.data.English : obj.data.body;
                        }

                        while (data && data.includes("src=\"\/attachments")) {
                            data = data.replace("src=\"\/attachments", "src=\"" + url + "\/attachments");
                        }

                        // EDIT BUTTON
                        let EditNoteButton;
                        if (access.isEditable(obj, this.props.author) === true) {
                            EditNoteButton = <Button className="float-right" variant="outline-info" onClick={() => this.editNote(obj._id, "write")}>Edit Note</Button>
                        } else {
                            EditNoteButton = <Button className="float-right" variant="outline-info" onClick={() => this.editNote(obj._id, "read")}>Read Note</Button>
                        }

                        return (
                            <Row className="min-height-2 mrg-05 border rounded mrg-1-bot pd-1" key={i}>
                                <Col>
                                    <Row>
                                        <Col md="10" className="pd-1 primary-800 font-weight-bold">{obj.title}</Col>
                                        <Col md="2">
                                            <Button variant="outline-secondary" className="circular-border float-right"
                                                onClick={() => this.props.updateCheckedNotes({ checked: false, noteId: obj._id })}>
                                                <i className="fas fa-times"></i>
                                            </Button>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <span className="pd-1" dangerouslySetInnerHTML={{ __html: data ? (data) : (obj.data.English ? obj.data.English : obj.data.body) }} />
                                        </Col>
                                    </Row>
                                    {RiseAboveNotes}
                                    <Row>
                                        <Col>
                                            <Col><div className="primary-600 sz-075 pd-05 float-left">{this.props.users[obj.authors[0]].firstName + " "+ this.props.users[obj.authors[0]].lastName } &nbsp; {formatter.format(new Date(obj.created))}</div></Col>
                                            <Col><Button className="float-right mrg-1-left" variant="outline-info" onClick={() => this.props.buildOn(obj._id)}>BuildOn</Button></Col>
                                            <Col>{EditNoteButton}</Col>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        )
                    }
                )}
            </>
        )
    }

}

const mapStateToProps = (state, ownProps) => {
    const viewNotes = state.notes.viewNotes
    const users = state.users
    return {
        viewId: state.globals.viewId,
        views: state.globals.views,
        view: state.globals.view,
        checkedNotes: state.notes.checkedNotes.map(
            noteId => noteId in viewNotes ? //Find note in viewNotes or in riseAboveNotes
                viewNotes[noteId] : state.notes.riseAboveNotes[noteId]
        ),
        viewLinks: state.notes.viewLinks,
        author: state.globals.author,
        communityId: state.globals.communityId,
        riseAboveViewNotes: state.notes.riseAboveViewNotes,
        riseAboveNotes: state.notes.riseAboveNotes,
        users: users,
    }
}

const mapDispatchToProps = {
    openContribution,
    updateCheckedNotes,
    createRiseAbove,
    fetchViewCommunityData
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NoteContent);
