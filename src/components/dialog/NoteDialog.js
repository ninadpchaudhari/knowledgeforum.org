import React, {useEffect, useState} from 'react'
import { useSelector, useDispatch } from 'react-redux';
import Dialog from './Dialog.js'
import DrawTool from '../drawDialog/DrawTool.js'
import Note from '../note/Note.js'
import {removeNote, postContribution, buildOnNote} from '../../store/noteReducer.js'
import {closeDialog } from '../../store/dialogReducer.js'

const NoteDialog = props => {

    const dialog = props.dialog
    const reduxNote = useSelector(state => state.notes[dialog.contribId])
    const dispatch = useDispatch();
    const [note, setNote] = useState(null);//make copy of note from redux
    const [drawTool, setDrawTool] = useState(false);
    const [svg, setSvg] = useState(null);
    const [drawing, setDrawing] = useState(null);

    useEffect(()=>{
        setNote(prevNote => {
            if (prevNote === null) //Initialize once
                return {...reduxNote}
            else //Only update attachmets
                return {...prevNote, attachments: reduxNote.attachments }
        })
    }, [reduxNote])


    const onDialogClose = (dlg) => {
        dispatch(closeDialog(dlg.id));
        dispatch(removeNote(dlg.contribId));
    }

    const onDialogConfirm = () => {
        dispatch(postContribution(note, dialog.id));
    }

    const onBuildOnClick = (noteId) => {
        dispatch(buildOnNote(noteId));
    }

    const onNoteChange = (noteChanged) => {
        setNote(prevNote => {
            const newNote = {...prevNote, ...noteChanged}
            newNote.data = { ...prevNote.data, ...noteChanged.data}
            return newNote
        })
    }

    const openDrawDialog = (svg) => {
        if (svg) {
            setSvg(svg)
        }
        setDrawTool(true)
    }

    const closeDrawDialog = () => {
        setSvg(null)
        setDrawTool(false);
    }

    const onDrawingInserted = () => { setDrawing(null)}

    const onConfirmDrawDialog = (drawing) => {
        setDrawing(drawing)
        closeDrawDialog()
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
                {note ?
                 <Note
                     key={dialog.contribId}
                     dlgId={dialog.id}
                     note={note}
                     mode={dialog.editable? "write": "read"}
                     drawing={drawing}
                     onNoteChange={onNoteChange}
                     onDrawToolOpen={openDrawDialog}
                     onDrawingInserted={onDrawingInserted}
                 />
                : null}

            </Dialog>
            { drawTool ?
             <DrawTool onClose={closeDrawDialog}
                         onConfirm={onConfirmDrawDialog}
                         svg={svg}
             /> : null}
        </div>
    )
}

export default NoteDialog;
