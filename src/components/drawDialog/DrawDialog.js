import React, {useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Dialog from '../dialog/Dialog.js'
import History from '../historyTab/History'
import Properties from '../propertiesTab/Properties'
import AuthorTab from '../authorsTab/AuthorTab'
import { Tabs, Tab, Row, Col, Form } from 'react-bootstrap';
import {closeDialog } from '../../store/dialogReducer.js'
import {removeNote, postContribution, buildOnNote, editNote, fetchRecords} from '../../store/noteReducer.js'
import { dateFormatOptions, fetchCommGroups } from '../../store/globalsReducer.js'
const DrawDialog = props => {
    const formatter = new Intl.DateTimeFormat('default', dateFormatOptions)
    const dialog = props.dialog
    const drawing = useSelector(state => state.notes[dialog.contribId])
    const drawingAuthor = useSelector(state => state.users[drawing.authors[0]] || 'NA')
    const timestamp = formatter.format(new Date(drawing.modified))
    let iframe_ref;
    const dispatch = useDispatch();

    const [selectedTab, setSelectedTab] = useState("write");

    const onTabSelected = (tab) => {
        setSelectedTab(tab)
        if (tab === 'history') { //Refresh records
            dispatch(fetchRecords(drawing._id))
        } if (tab === 'author') { //Refresh groups, and authors?
            dispatch(fetchCommGroups(drawing.communityId))
        }
    }

    const onDialogConfirm = () => {
        const wnd = iframe_ref.contentWindow;
        wnd.svgCanvas.setResolution('fit', 100);
        const bg = wnd.svgCanvas.current_drawing_.all_layers[0];
        const point = wnd.svgCanvas.current_drawing_.all_layers[1];

        const widd = point[1].getBBox().width;
        const heig = point[1].getBBox().height;
        if (widd === 0 || heig === 0){
            onDialogClose()
            return;
        }
        const rec = bg[1].children[1];
        if (rec.attributes.fill.value === 'none'){
            const po = wnd.svgCanvas.current_drawing_.all_layers[1];
            if (po[1].childNodes.length > 1){
                wnd.svgCanvas.current_drawing_.svgElem_.setAttribute("width", widd + 2);
                wnd.svgCanvas.current_drawing_.svgElem_.setAttribute("height", heig + 2)
                const p = wnd.svgCanvas.current_drawing_.all_layers[0];
                p[1].childNodes[1].setAttribute("width", widd);
                p[1].childNodes[1].setAttribute("height", heig);
                wnd.svgCanvas.selectAllInCurrentLayer();
                wnd.svgCanvas.groupSelectedElements();
                wnd.svgCanvas.alignSelectedElements('l', 'page')
                wnd.svgCanvas.alignSelectedElements('t', 'page')
                wnd.svgCanvas.ungroupSelectedElement();
                wnd.svgCanvas.clearSelection();
            }
        }
        wnd.svgCanvas.setResolution('fit', 'fit')
        const newDrawing = {...drawing}
        newDrawing.data = {...newDrawing.data, svg: wnd.svgCanvas.svgCanvasToString()}
        dispatch(postContribution(newDrawing, dialog.id))
    }

    const onDialogClose = (dlg) => {
        dispatch(closeDialog(dlg.id));
        dispatch(removeNote(dlg.noteId));
    }

    const getIframeRef = (frame) => {
        if(!frame) {
            return
        }
        iframe_ref = frame
    }

    const onLoad = (e) => {
        console.log("on load draw")
        const svg = drawing.data.svg
        if (svg){
            e.target.contentWindow.svgCanvas.setSvgString(svg)
            e.target.contentWindow.svgCanvas.setResolution('fit', 'fit')
        }
    }

    const onChange = (drawingChanged) => {
        dispatch(editNote({"_id": drawing._id, ...drawingChanged}));
    }

    const onBuildOnClick = (noteId) => {
        dispatch(buildOnNote(noteId));
    }

    return (
            <Dialog key={dialog.id}
                    id={dialog.id}
                    onMouseDown={props.onMouseDown}
                    title={dialog.title}
                    style={{zIndex: dialog.zIndex}}
                    onClose={()=>onDialogClose(dialog)}
                    onConfirm={()=> onDialogConfirm(dialog)}
                    confirmButton={dialog.confirmButton}
                    editable={dialog.editable}
                    buildon={dialog.buildOn}
                    onBuildOnClick={()=>onBuildOnClick(dialog.contribId)}
            >
                <div>
                    <div className='contrib-info'>
                        Created By: {drawingAuthor.firstName} {drawingAuthor.lastName} <br />
                        Last modified: {timestamp}
                    </div>
                    <Tabs activeKey={selectedTab} transition={false} onSelect={onTabSelected}>
                        <Tab eventKey="write" title="write" style={{height: '90%'}}>
                            {drawing ?
                             (<>
                                 <Row>
                                     <Col>
                                         <Form.Group className="write-title-form" controlId="note-title">
                                             <Form.Control type="text"
                                                           className="write-tab-input"
                                                           size="sm"
                                                           placeholder="Enter title"
                                                           value={drawing.title}
                                                           onChange={(val) => {onChange({title: val.target.value})}}/>
                                         </Form.Group>
                                     </Col>
                                 </Row>
                                 <iframe onLoad={onLoad} title='DrawingTool' src='/drawing-tool/svg/index.html' ref={getIframeRef} width='100%' height='100%'></iframe>
                             </>)
                            :
                             ''
                            }
                        </Tab>
                        <Tab eventKey="author" title="author(s)">
                            <AuthorTab contrib={drawing} onChange={onChange} />
                        </Tab>
                        <Tab eventKey='history' title='history'><History records={drawing.records} /></Tab>
                        <Tab eventKey='properties' title='properties'><Properties contribution={drawing} onChange={onChange} /></Tab>
                    </Tabs>
                </div>

            </Dialog>
        )
}

export default DrawDialog
