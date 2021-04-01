import React, {useCallback} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {focusDialog } from '../../store/dialogReducer.js'
import NoteDialog from '../dialog/NoteDialog.js'
import AttachmentDialog from '../dialog/AttachmentDialog.js'
const DialogHandler = props => {
    const dialogs = useSelector(state => state.dialogs);
    const dispatch = useDispatch();

    const onFocusDialog = useCallback(
        (dlgId) => dispatch(focusDialog(dlgId)),
        [dispatch]
    );

    return (
        <div>{
            dialogs.dialogs.map((elt, i) => {

                if (elt.type === 'Note'){
                    return (
                        <NoteDialog
                            key={elt.id}
                            dialog={elt}
                            onMouseDown={() => onFocusDialog(elt.id)}
                        >
                        </NoteDialog>
                    )
                } else if (elt.type === 'Attachment'){
                    return (
                        <AttachmentDialog
                            key={elt.id}
                            dialog={elt}
                            onMouseDown={() => onFocusDialog(elt.id)}
                        />
                    )
                } else {
                    return ''
                }
            })
        }

        </div>
    )

}
export default DialogHandler;
