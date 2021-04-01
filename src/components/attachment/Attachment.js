import React, {useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import History from '../historyTab/History'
import Properties from '../propertiesTab/Properties'
import AuthorTab from '../authorsTab/AuthorTab'
import { Tabs, Tab, Container, Row, Col, Form } from 'react-bootstrap';
import { dateFormatOptions, fetchCommGroups } from '../../store/globalsReducer.js'
import {fetchRecords} from '../../store/noteReducer.js'
import {url as serverUrl} from '../../store/api'

const Attachment = (props) => {
    const formatter = new Intl.DateTimeFormat('default', dateFormatOptions)
    const timestamp = formatter.format(new Date(props.attachment.modified))
    const attachAuthor = useSelector(state => state.users[props.attachment.authors[0]] || 'NA')
    const dispatch = useDispatch();
    const [selectedTab, setSelectedTab] = useState("read");
    const onTabSelected = (tab) => {
        setSelectedTab(tab)
        if (tab === 'history') { //Refresh records
            dispatch(fetchRecords(props.attachment._id))
        } if (tab === 'author') { //Refresh groups, and authors?
            dispatch(fetchCommGroups(props.attachment.communityId))
        }
    }

    return (
        <div>
            <div className='contrib-info'>
                Created By: {attachAuthor.firstName} {attachAuthor.lastName} <br />
                Last modified: {timestamp}
            </div>
            <Tabs activeKey={selectedTab} transition={false} onSelect={onTabSelected}>
                <Tab eventKey="read" title="read">

                    <a href={`${serverUrl}${(props.attachment.data.downloadUrl || props.attachment.data.url)}`} title={props.attachment.title} download>
                        { props.attachment.data.url }
                    </a>
                </Tab>

                <Tab eventKey="write" title="write">
                    <Row>
                        <Col>
                            <Form.Group className="write-title-form" controlId="note-title">
                                <Form.Control type="text"
                                              className="write-tab-input"
                                              size="sm"
                                              placeholder="Enter title"
                                              value={props.attachment.title}
                                              onChange={(val) => {props.onChange({title: val.target.value})}}/>
                            </Form.Group>
                        </Col>
                    </Row>
                </Tab>

                <Tab eventKey="author" title="author(s)">
                    <AuthorTab contrib={props.attachment} onChange={props.onChange} />
                </Tab>
                <Tab eventKey='history' title='history'><History records={props.attachment.records} /></Tab>
                <Tab eventKey='properties' title='properties'><Properties contribution={props.attachment} onChange={props.onChange} /></Tab>
            </Tabs>
        </div>

    )
}

export default Attachment
