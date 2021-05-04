import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux'
import { Form, FormGroup, Input } from 'reactstrap';
import { Button, Collapse } from 'react-bootstrap';
import ListOfNotes from './ListOfNotes.js'
import { dateFormatOptions } from '../../../store/globalsReducer'
import { newNote, updateCheckedNotes, openContribution } from '../../../store/noteReducer'
import { Breakpoint } from 'react-socks';
import { url } from '../../../store/api'
import * as access from '../../../store/access'

class Notes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            note: {},
            showNote: false,
            open: false,
            riseAboveData: {},
            isCheckedMobile: false,
        };
        this.checkNote = this.checkNote.bind(this)
        this.editNote = this.editNote.bind(this);
        this.buildOn = this.buildOn.bind(this);
    }

    componentDidMount() {
    }

    buildOn = (buildOn) => {
        this.props.newNote(this.props.view, this.props.communityId, this.props.authorObj._id, buildOn);
    }

    editNote = (contribId, mode) => {
        this.props.openContribution(contribId, mode);
    }

    setOpen = (value) => {
        this.setState((prevState) => {
            return { open: !prevState.open }
        })
    }

    checkNote = (evt, noteId) => {
        this.props.updateCheckedNotes({ noteId, checked: evt.target.checked })
    }

    updateNoteMobile = (e, note) => {
        this.setState({
            isCheckedMobile: e.target.checked
        })
    }

    render() {
        const hasChildren = this.props.children && Object.keys(this.props.children).length !== 0;;
        const icon = this.state.open ? "fa-chevron-down" : "fa-chevron-right"
        const formatter = new Intl.DateTimeFormat('default', dateFormatOptions)
        let NoteMobile;
        let data = this.props.note.data.body;
        //eslint-disable-next-line
        while (data.includes("src=\"\/attachments")) {
            //eslint-disable-next-line
            data = data.replace("src=\"\/attachments", "src=\"" + url + "\/attachments");
        }

        let EditNoteButton;
        if (access.isEditable(this.props.note, this.props.authorObj) === true) {
            EditNoteButton = <Button className="float-right" variant="outline-info" onClick={() => this.editNote(this.props.note._id, "write")}>Edit Note</Button>
        } else {
            EditNoteButton = <Button className="float-right" variant="outline-info" onClick={() => this.editNote(this.props.note._id, "read")}>Read Note</Button>
        }

        if (this.state.isCheckedMobile) {
            NoteMobile = <div>
                <Row>
                    <Col>
                        <Row dangerouslySetInnerHTML={{ __html: data }}></Row>
                        <Row>
                            <Button className="float-right mrg-1-left mrg-1-right" variant="outline-info" onClick={() => this.buildOn(this.props.note._id)}>BuildOn</Button>
                            {EditNoteButton}
                        </Row>
                    </Col>
                </Row>
            </div>
        }

        return (
            <>
                <Breakpoint medium up>
                    <div>
                        <Row>
                            <Col className="mr-auto rounded">
                                <Row className="pd-05">
                                    <Col md="10" className="primary-800 font-weight-bold">
                                        {hasChildren ?
                                            <Button variant='link' onClick={() => this.setOpen(!this.open)} aria-controls="example-collapse-text" aria-expanded={this.state.open}>
                                                <i className={`fa ${icon}`}></i>
                                            </Button>
                                            : null}
                                        {this.props.note.title}</Col>
                                    <Col md="2">
                                        <Form className="mrg-1-min pd-2-right">
                                            <FormGroup>
                                                <Input type="checkbox" checked={this.props.isChecked} ref={this.props.note._id} onChange={e => this.checkNote(e, this.props.note._id)} />
                                            </FormGroup>
                                        </Form>
                                    </Col>
                                </Row>
                                <Row className="primary-600 sz-075 pd-05">
                                    <Col><span> {this.props.author} </span>&nbsp; {formatter.format(new Date(this.props.note.created))}</Col>
                                    <Col md="2">
                                        {/* <Button onClick={() => this.buildOn(this.props.oneHirarchy.to)}>BuildOn</Button> */}
                                    </Col>
                                </Row>
                                {this.props.children ?
                                    <Collapse in={this.state.open}>
                                        <Row>
                                            <Col md="1"></Col>
                                            <Col md="11">
                                                <ListOfNotes hierarchy={this.props.children}></ListOfNotes>
                                            </Col>
                                        </Row>
                                    </Collapse>
                                    : null}
                            </Col>
                        </Row>
                    </div>
                </Breakpoint>

                {/* MOBILE SCREEN */}
                <Breakpoint small down>
                    <div>
                        <Row>
                            <Col className="mr-auto rounded">
                                <Row className="pd-05">
                                    <Col md="10" className="primary-800 font-weight-bold">
                                        {hasChildren ?
                                            <Button variant='link' onClick={() => this.setOpen(!this.open)} aria-controls="example-collapse-text" aria-expanded={this.state.open}>
                                                <i className={`fa ${icon}`}></i>
                                            </Button>
                                            : null}
                                        {this.props.note.title}</Col>
                                    <Col md="2">
                                        <Form className="mrg-1-min pd-2-right">
                                            <FormGroup>
                                                <Input type="checkbox" checked={this.state.isCheckedMobile} ref={this.props.note._id} onChange={e => this.updateNoteMobile(e, this.props.note)} />
                                            </FormGroup>
                                        </Form>
                                    </Col>
                                </Row>
                                <Row className="primary-600 sz-075 pd-05">
                                    <Col><span> {this.props.author} </span>&nbsp; {formatter.format(new Date(this.props.note.created))}</Col>
                                    <Col md="2">
                                        {/* <Button onClick={() => this.buildOn(this.props.oneHirarchy.to)}>BuildOn</Button> */}
                                    </Col>
                                </Row>
                                {this.props.children ?
                                    <Collapse in={this.state.open}>
                                        <Row>
                                            <Col md="1"></Col>
                                            <Col md="11">
                                                <ListOfNotes hierarchy={this.props.children}></ListOfNotes>
                                            </Col>
                                        </Row>
                                    </Collapse>
                                    : null}
                            </Col>
                        </Row>
                        {NoteMobile}
                    </div>
                </Breakpoint>
            </>
        )
    }

}

const mapStateToProps = (state, ownProps) => {
    const author = state.users[ownProps.note.authors[0]]
    return {
        author: (author && `${author.firstName} ${author.lastName}`) || 'NA',
        isChecked: state.notes.checkedNotes.includes(ownProps.note._id),
        riseAboveViewNotes: state.notes.riseAboveViewNotes,
        riseAboveNotes: state.notes.riseAboveNotes,
        view: state.globals.view,
        communityId: state.globals.communityId,
        authorObj: state.globals.author,
    }
}

const mapDispatchToProps = {
    updateCheckedNotes,
    openContribution,
    newNote,
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Notes)
