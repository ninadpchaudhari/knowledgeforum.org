import React, {useEffect} from 'react';
import DialogHandler from '../dialogHandler/DialogHandler.js'
import {Button} from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux';
import {newNote, openContribution} from '../../store/noteReducer.js'
import { fetchView, fetchCommunity} from '../../store/globalsReducer.js'
import { fetchAuthors } from '../../store/userReducer.js'
const NewNote = props => {

    const communityId = useSelector((state) => state.globals.communityId)
    const viewId = useSelector((state) => state.globals.viewId)
    const view = useSelector((state) => state.globals.view)
    const author = useSelector(state => state.globals.author);
    const dispatch = useDispatch();
    const createNewNote = () => {
        dispatch(newNote(view, communityId, author._id))
    };

    const openNote = (contribId) => {
        dispatch(openContribution('5ee2aefee028a1d4cfb07252'))
    }

    useEffect(() => {
        /* dispatch(fetchAuthor(communityId)); */
        dispatch(fetchView(viewId))
        dispatch(fetchCommunity(communityId));
        dispatch(fetchAuthors(communityId))
    }, [dispatch, communityId, viewId]);

    return (
        <div style={{marginTop: '100px'}} >
            <Button onClick={createNewNote}>New Note</Button>
            <br />
            <Button onClick={openNote}>Open Note</Button>
            <DialogHandler/>
        </div>
    );
}

export default NewNote;
