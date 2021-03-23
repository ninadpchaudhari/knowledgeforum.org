import React, {useCallback} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {focusDialog } from '../../store/dialogReducer.js'
import NoteDialog from '../dialog/NoteDialog.js'

const DialogHandler = props => {
    const dialogs = useSelector(state => state.dialogs);
    const dispatch = useDispatch();

    const onFocusDialog = useCallback(
        (dlgId) => dispatch(focusDialog(dlgId)),
        [dispatch]
    );

    return (
        <div>{
            dialogs.dialogs.map((elt, i) =>
                <NoteDialog
                    key={elt.id}
                    dialog={elt}
                    onMouseDown={() => onFocusDialog(elt.id)}
                >
                </NoteDialog>
            )
        }

        </div>
    )

}
export default DialogHandler;
