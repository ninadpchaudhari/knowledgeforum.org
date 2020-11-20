import React from 'react';
import { Tabs, Tab, Col, Row } from 'react-bootstrap';
import WriteTab from '../writeTab/WriteTab'
import History from '../historyTab/History'
import Properties from '../propertiesTab/Properties'
import AuthorTab from '../authorsTab/AuthorTab'
import Annotator from '../annotator/Annotator'
import RiseAboveView from '../RiseAboveView/RiseAboveView'
import { connect } from 'react-redux'
import {
    editNote, removeDrawing, editSvgDialog, setAnnotationsLoaded,
    fetchAttachments, setWordCount, fetchRecords,
    createAnnotation, deleteAnnotation, modifyAnnotation, deleteAttachment, openContribution
} from '../../store/noteReducer.js'
import { openDrawDialog } from '../../store/dialogReducer.js'
import { scaffoldWordCount } from '../../store/kftag.service.js'
import { dateFormatOptions, fetchCommGroups } from '../../store/globalsReducer.js'
import './Note.css'

class Note extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            riseAboveNotes: false,
            selectedTab: this.props.mode ? this.props.mode : "write",
        }
        this.onEditorSetup = this.onEditorSetup.bind(this)
        this.onDrawingToolOpen = this.onDrawingToolOpen.bind(this)
        this.addDrawing = this.addDrawing.bind(this)
        this.onNoteChange = this.onNoteChange.bind(this)
        this.wordCount = this.wordCount.bind(this)
        this.onTabSelected = this.onTabSelected.bind(this)
        this.onAnnotationCreated = this.onAnnotationCreated.bind(this)
        this.onAnnotationDeleted = this.onAnnotationDeleted.bind(this)
        this.onAnnotationUpdated = this.onAnnotationUpdated.bind(this)
        this.editNote = this.editNote.bind(this)
    }

    componentDidMount() {
        // if (this.props.riseAboveViewNotes[this.props.note._id]) {
        //     this.setState({
        //         // riseAboveNotes: this.props.riseAboveViewNotes[this.props.note._id].map((noteId) => this.props.riseAboveNotes[noteId])
        //         riseAboveNotes: true,
        //         selectedTab: "read"
        //     })
        // }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.drawing && prevProps.drawing !== this.props.drawing && this.props.drawTool === this.props.noteId) {
            this.editor.insertContent(this.props.drawing)
            this.props.removeDrawing()
        }
    }

    onNoteChange(note) {
        if (note.scaffold) {
            const { tagCreator, initialText } = note.scaffold;
            this.addSupport(true, initialText, tagCreator)
        } else if (note.attach) {
            this.editor.insertContent(note.attach)
        } else if (note.deleteAttach) {
            this.props.deleteAttachment(this.props.noteId, note.deleteAttach)
            this.editor.dom.remove(this.editor.dom.select('.' + note.deleteAttach))
        }
        else {
            this.props.editNote({ _id: this.props.noteId, ...note })
            if (note.data && note.data.body) {
                this.wordCount(note.data.body);
            }
        }
    }

    wordCount(text) {
        const wordCount = this.editor.plugins.wordcount.getCount() - scaffoldWordCount(text);
        this.props.setWordCount({ contribId: this.props.noteId, wc: wordCount })
    }

    onEditorSetup(editor) {
        editor.onDrawButton = this.onDrawingToolOpen;
        this.editor = editor;
    }

    onDrawingToolOpen(svg) {
        //Create dialog
        if (svg) {
            this.props.editSvgDialog(this.props.noteId, svg);
        } else {
            this.props.openDrawDialog(this.props.noteId);
        }
    }

    addDrawing(drawing) {
        // Add draw to editor
        this.editor.insertContent(drawing);
    }

    addSupport(selection, initialText, tagCreator) {
        const selected = this.editor.selection.getContent();
        let text = selected.length ? selected : initialText;
        const { tag, supportContentId } = tagCreator(text);
        this.editor.insertContent(tag)
        //select text after insert
        if (selection) {
            const contentTag = this.editor.dom.get(supportContentId);
            if (contentTag)
                this.editor.selection.setCursorLocation(contentTag)
        }
    }

    onTabSelected(tab) {
        this.setState({selectedTab: tab })
        if (tab === 'history') { //Refresh records
            this.props.fetchRecords(this.props.note._id)
        } if (tab === 'author') { //Refresh groups, and authors?
            this.props.fetchCommGroups(this.props.note.communityId)
        }
    }

    onAnnotationCreated(annotation) {
        this.props.createAnnotation(this.props.note.communityId, this.props.note._id, this.props.noteAuthor._id, annotation)
    }

    onAnnotationDeleted(annotation) {
        if (annotation.linkId && annotation.modelId) {
            this.props.deleteAnnotation(annotation.linkId, this.props.note._id, annotation.modelId);
        }
    }

    onAnnotationUpdated(annotation) {
        if (!annotation.linkId || !annotation.modelId) {
            console.error('ERROR! annoVM doesn\'t have id on update');
            return;
        }
        const model = Object.assign({}, this.props.note.annos[annotation.modelId])
        if (!model) {
            console.error('ERROR! model couldn\'t find');
            return;
        }
        model.data = annotation;
        this.props.modifyAnnotation(model, this.props.note.communityId, this.props.note._id)
    }
    
    editNote = (noteId) => {
        this.props.openContribution(noteId)
    }

    render() {
        const formatter = new Intl.DateTimeFormat('default', dateFormatOptions)
        return (
            <div>
                <div className='contrib-info'>
                    Created By: {this.props.noteAuthor.firstName} {this.props.noteAuthor.lastName} <br />
                    Last modified: {formatter.format(new Date(this.props.note.modified))}
                </div>
                <Tabs activeKey={this.state.selectedTab} transition={false} onSelect={this.onTabSelected}>
                    <Tab eventKey="read" title="read">
                        <Row>
                            {!this.state.riseAboveNotes ?
                                <Col>
                                    <Annotator containerId={this.props.dlgId}
                                        content={this.props.note.data.body}
                                        annots={this.props.note.annos}
                                        annotsFetched={this.props.note.annotsFetched}
                                        author={this.props.noteAuthor}
                                        onCreate={this.onAnnotationCreated}
                                        onUpdate={this.onAnnotationUpdated}
                                        onDelete={this.onAnnotationDeleted}
                                        onAnnotsLoaded={() => this.props.setAnnotationsLoaded({ contribId: this.props.note._id, value: 0 })}
                                    >
                                    </Annotator>
                                </Col>
                                :
                                (<>
                                    <Col md="6">
                                        <Annotator containerId={this.props.dlgId}
                                            content={this.props.note.data.body}
                                            annots={this.props.note.annos}
                                            annotsFetched={this.props.note.annotsFetched}
                                            author={this.props.noteAuthor}
                                            onCreate={this.onAnnotationCreated}
                                            onUpdate={this.onAnnotationUpdated}
                                            onDelete={this.onAnnotationDeleted}
                                            onAnnotsLoaded={() => this.props.setAnnotationsLoaded({ contribId: this.props.note._id, value: 0 })}
                                        >
                                        </Annotator>
                                    </Col>
                                    <Col md="5">
                                        <RiseAboveView riseAboveViewId={this.props.note._id} editNote = {this.editNote}/>
                                    </Col>
                                    <Col></Col>
                                </>)}
                        </Row>
                    </Tab>
                    {
                        this.props.mode !== "read" ?

                        <Tab eventKey="write" title="write">
                            <WriteTab
                                note={this.props.note}
                                onScaffoldSelected={this.scaffoldSelected}
                                onChange={this.onNoteChange}
                                onEditorSetup={this.onEditorSetup}
                            ></WriteTab>
                        </Tab>
                        :
                        ''
                    }
                    <Tab eventKey="author" title="author(s)">
                        <AuthorTab contribId={this.props.noteId} />
                    </Tab>
                    <Tab eventKey='history' title='history'><History records={this.props.note.records} /></Tab>
                    <Tab eventKey='properties' title='properties'><Properties contribution={this.props.note} onChange={this.onNoteChange} /></Tab>
                </Tabs>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const note = state.notes[ownProps.noteId]
    return {
        note: note,
        drawing: state.notes.drawing,
        drawTool: state.dialogs.drawTool,
        noteAuthor: note && (state.users[note.authors[0]] || 'NA'),
        riseAboveViewNotes: state.notes.riseAboveViewNotes,
        riseAboveNotes: state.notes.riseAboveNotes,
        currentAuthor: state.globals.author,
        editable: false || (note && note.authors.includes(state.globals.author._id))
    }
}

const mapDispatchToProps = {
    editNote, openDrawDialog, setWordCount,
    removeDrawing, editSvgDialog, fetchAttachments, fetchRecords,
    deleteAnnotation, fetchCommGroups, createAnnotation, modifyAnnotation,
    setAnnotationsLoaded, deleteAttachment, openContribution}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Note)

