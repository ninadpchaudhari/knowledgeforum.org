import React from 'react'
import { useSelector, useDispatch } from 'react-redux';
import Dialog from './Dialog.js'
import Attachment from '../attachment/Attachment.js'
import {removeNote, postContribution, buildOnNote, editNote} from '../../store/noteReducer.js'
import {closeDialog } from '../../store/dialogReducer.js'

const AttachmentDialog = props => {

    const dialog = props.dialog
    const attachment = useSelector(state => state.notes[dialog.contribId])
    const dispatch = useDispatch();


    const onDialogClose = (dlg) => {
        dispatch(closeDialog(dlg.id));
        dispatch(removeNote(dlg.noteId));
    }

    const onDialogConfirm = () => {
        dispatch(postContribution(attachment, dialog.id));
    }

    const onBuildOnClick = (noteId) => {
        dispatch(buildOnNote(noteId));
    }

    const onChange = (attachmentChanged) => {
        dispatch(editNote({"_id": attachment._id, ...attachmentChanged}));
    }

    return (
        <div>
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
                {attachment ?
                 <Attachment
                     key={dialog.contribId}
                     dlgId={dialog.id}
                     attachment={attachment}
                     mode={dialog.editable? "write": "read"}
                     onChange={onChange}
                 />
                : null}

            </Dialog>
        </div>
    )
}

export default AttachmentDialog;
