import React, {useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Button, Form, ProgressBar} from 'react-bootstrap'
import { addNotification } from '../../store/notifier.js'
import { fetchAttachments, fetchLinks } from '../../store/noteReducer.js'
import { FileDrop } from 'react-file-drop';
import {url as serverUrl} from '../../store/api.js'
import './AttachPanel.css'

import {postAttachment, uploadFile, putObject, postLink, putLink} from '../../store/api.js'

//TODO if dropping files is not supported
const AttachPanel = props => {
    const author = useSelector(state => state.globals.author);
    const dispatch = useDispatch();
    const [progress, setProgress] = useState(0);

    const  handleClose= (e) => {
        props.onClose();
    }
    const onFileChange = (e) => {
        onFileSelect(e.target.files);
        // TODO After upload, clear input
        /* e.target.value = null; */

    }
    const onFileSelect = async (fileList) => {
        const files = Array.from(fileList)
        setProgress(0)
        // TODO googleOauth, googledrive
        const upload_promises = []
        files.forEach(async (file) => {
            if (file.type.indexOf("image/") >= 0){
                const _URL = window.URL || window.webkitURL;
                const img = await addImageProcess(_URL.createObjectURL(file))
                var width  = img.naturalWidth  || img.width;
                var height = img.naturalHeight || img.height;
                file.width = width;
                file.height = height;
                upload_promises.push(createAttachment(file, 'image'))
            }else if (file.type.startsWith('video')){
                upload_promises.push(createAttachment(file, 'video'))
            }else{
                upload_promises.push(createAttachment(file, 'link'))
            }
        });

        await Promise.all(upload_promises)
        handleClose()
        addNotification({title: 'Uploaded!', type:'success', message:'Attachments uploaded!'})
    }
    const addImageProcess = (src) => {
        return new Promise((resolve, reject) => {
            let img = document.createElement("img")
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = src
        })
    }
    const createAttachment = async (file, type, x, y) => {
        try {
            const attachRes = await postAttachment(author.communityId, author._id)
            const uploadRes = await uploadFile(file, onUploadProgress)
            const attachment = attachRes.data
            const data = uploadRes.data
            attachment.title = data.filename;
            attachment.status = 'active';
            data.version = attachment.data.version + 1;
            attachment.data = data;
            attachment.tmpFilename = data.tmpFilename;
            const newAttachment = await putObject(attachment, author.communityId, attachment._id)

            newAttachment.data.width = file.width;
            newAttachment.data.height = file.height;

            if (props.noteId){
                linkToNote(newAttachment, type);
            }else if (props.viewId){
                linkToView(newAttachment, x, y, type);
            }
        } catch (err) {
            console.log(err)
        } finally {

        }

    }

    const linkToNote = async (attachment, type) => {
            await postLink(props.noteId, attachment._id, 'attach')
            //TODO updateFromConnections
            dispatch(fetchLinks(props.noteId, 'from'))
            if (props.inlineAttach){
                const data_mce_src = `${serverUrl}${attachment.data.url}`;
                const title = attachment.title;
                let html = '';
                if (type==='image') {
                    html = '<img class="inline-attachment ' + attachment._id + '" src="' + data_mce_src +'" width="100px" alt="' + title + '" data-mce-src="' + data_mce_src + '">';
                } else if (type==='video') {
                    html = `<video controls="controls" width="300" height="150"> <source src="${data_mce_src}" type="video/mp4" /></video>`
                } else {
                    html ='<a class="inline-attachment ' + attachment._id + '" href="' + data_mce_src + '" target="_blank" download>';
                    html += `<img src="${serverUrl}/manual_assets/kf6images/03-toolbar-attachment.png" alt="` + title + '">' + title + '</a>';
                }
                props.onNewInlineAttach(html)
            }
            dispatch(fetchAttachments(props.noteId))
            //TODO googledrive
            /* if(newAttachment.data.type.indexOf('video') === 0 && $community.isPluginEnabled('googledrive')){
             *     $scope.save2GoogleDrive(userName, newAttachment);
             * } */
    }

    const linkToView = async (attachment, x, y, attach_type) => {
        const newX = x ? x: 200;
        const newY = y ? y: 200;
        let w = 200;
        let h = 200;
        let showInPlace = false;
        if (attach_type ==='image'){
            w = attachment.data.width;
            h = attachment.data.height;
            if (w > 200){ w = 200; }
            h = (w*h) / attachment.data.width;
            showInPlace = true;
        }
        const link = await postLink(
            props.viewId,
            attachment._id,
            'contains',
            {x: newX, y: newY, width: w, height: h}
        )
        if (showInPlace){
            link.data.showInPlace = true
            await putLink(link._id, link)
        }

    }
    const onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setProgress(percentCompleted)
    }

    const styles = { width: '100%', color: 'black' };
    return (
        <Modal show={props.attachPanel} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Insert Attachment File</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.File id="custom-file">
                    <Form.File.Input onChange={onFileChange}/>
                </Form.File>
                <div style={styles}>
                    <FileDrop
                        onFrameDragEnter={(event) => console.log('onFrameDragEnter', event)}
                        onFrameDragLeave={(event) => console.log('onFrameDragLeave', event)}
                        onFrameDrop={(event) => console.log('onFrameDrop', event)}
                        onDragOver={(event) => console.log('onDragOver', event)}
                        onDragLeave={(event) => console.log('onDragLeave', event)}
                        onDrop={(files, event) => onFileSelect(files)}
                    >
                        or drop some files here!
                    </FileDrop>
                </div>
                <ProgressBar now={progress} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    )

};

export default AttachPanel;
