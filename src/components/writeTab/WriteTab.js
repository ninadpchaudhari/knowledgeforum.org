import React from 'react';
import MCEditor from '../editor/MCEditor'
import AttachPanel from '../attachmentCollapse/AttachPanel.js'
import {Container, Row, Col, Form} from 'react-bootstrap'
import ScaffoldSelect from '../scaffold/ScaffoldSelect'
import AttachArea from '../attachmentArea/AttachArea.js'

import './WriteTab.css';
class WriteTab extends React.Component {

    constructor(props){
        super(props)
        this.state = {inlineAttach: true, attachPanel: false}
        this.onScaffoldSelected = this.onScaffoldSelected.bind(this);
        this.onNewAttachmentClick = this.onNewAttachmentClick.bind(this);
        this.closeAttachPanel = this.closeAttachPanel.bind(this);
        this.onNewInlineAttach = this.onNewInlineAttach.bind(this);
        this.onAttachDelete = this.onAttachDelete.bind(this)
    }

    onScaffoldSelected(tagCreator, initialText){
        this.props.onChange({scaffold: {tagCreator, initialText}})
    }

    onNewAttachmentClick(inline){
        this.setState({inlineAttach: inline, attachPanel: true})
    }
    onNewInlineAttach(inlineAttach) {
        this.props.onChange({attach: inlineAttach})
    }
    closeAttachPanel()  {
        this.setState({attachPanel: false})
    }
    onAttachDelete(attachId) {
        this.props.onChange({deleteAttach: attachId})
    }
    render() {
        const {note, onChange, onEditorSetup} = this.props;
        return (
            <Container className='write-container p-0'>
                    <Row>
                        <Col>
                            <Form.Group controlId="note-title">
                                <Form.Control type="text"
                                              size="sm"
                                              placeholder="Enter title"
                                              value={note.title}
                                              onChange={(val) => {onChange({title: val.target.value})}}/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={2} className='pr-0'>
                            <ScaffoldSelect initVal={0} onScaffoldSelected={this.onScaffoldSelected}/>
                        </Col>
                        <Col md={10}>
                            <MCEditor value={note.data.body}
                                      onEditorSetup={onEditorSetup}
                                      onEditorChange={(content, editor) => onChange({ data: {body: content}})}/>
                            <div className='wordcount-bar text-right'>{note.wordCount} words</div>

                        </Col>
                    </Row>
                    <Row className='mt-2'>
                        <AttachPanel noteId={note._id} onClose={this.closeAttachPanel} onNewInlineAttach={this.onNewInlineAttach} {...this.state}></AttachPanel>
                        <AttachArea
                            noteId={note._id}
                            attachments={note.attachments}
                            onNewAttachClick={this.onNewAttachmentClick}
                            onNewInlineAttach={this.onNewInlineAttach}
                            onAttachDelete={this.onAttachDelete}
                        >
                        </AttachArea>
                    </Row>
            </Container>
        )
    }
}

export default WriteTab;
