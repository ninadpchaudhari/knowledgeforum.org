import React, {useCallback} from 'react';
import Dialog from '../dialog/Dialog.js';
import Note from '../note/Note.js';
import { useSelector, useDispatch } from 'react-redux';
import {closeDialog, closeDrawDialog, focusDialog } from '../../store/dialogReducer.js'
import {removeNote, addDrawing, postContribution} from '../../store/noteReducer.js'
import DrawDialog from '../drawDialog/DrawDialog.js'

const DialogHandler = props => {
    const dialogs = useSelector(state => state.dialogs);
    const dispatch = useDispatch();
    // Close dialog and remove dialog AND note from state

    const onDialogClose = useCallback(
        (dlg) => {
            dispatch(closeDialog(dlg.id));
            dispatch(removeNote(dlg.noteId));
        },
        [dispatch]
    )

    const onDialogConfirm = useCallback(
        (dlg) => {
            dispatch(postContribution(dlg.noteId, dlg.id));
            /* dispatch(closeDialog(dlg.id)); */
        },
        [dispatch]
    );

    const onFocusDialog = useCallback(
        (dlgId) => dispatch(focusDialog(dlgId)),
        [dispatch]
    );

    const onCloseDrawDialog = useCallback(
        () => {
            dispatch(closeDrawDialog())
        },
        [dispatch]
    );

    const onConfirmDrawDialog = useCallback(
        (drawing) => {
            dispatch(addDrawing(drawing))
            dispatch(closeDrawDialog())
        },
        [dispatch]
    );

    return (
        <div>{
            dialogs.dialogs.map((elt, i) =>
                <Dialog key={elt.id}
                        id={elt.id}
                        onMouseDown={() => onFocusDialog(elt.id)}
                        title={elt.title}
                        style={{zIndex: elt.zIndex}}
                        onClose={()=>onDialogClose(elt)}
                        onConfirm={()=> onDialogConfirm(elt)}
                        confirmButton={elt.confirmButton}
                        editable={elt.mode==="write"}>

                    <Note key={elt.noteId} dlgId={elt.id} noteId={elt.noteId} mode={elt.mode}/>
                </Dialog>
            )
        }

            {dialogs.drawTool!== null ?
             <DrawDialog onClose={onCloseDrawDialog}
                         onConfirm={onConfirmDrawDialog}
                         noteId={dialogs.drawTool}
             /> : null}

        </div>
    )

}
export default DialogHandler;
