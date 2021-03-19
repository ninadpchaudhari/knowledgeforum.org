import * as api from './api.js'
import { addViewLink, addViewNote } from './noteReducer.js'

export const updateViewLink = (link) => async (dispatch, getState) => {
    await api.putLink(link._id, link);
}

//When new view link received, add/update to store, fetch
export const onViewLink = (link) => async (dispatch, getState) => {
    const viewId = getState().globals.viewId;
    if (viewId === link.from){
        dispatch(addViewLink(link));
        if (link._to.type === "Note"){
            const note = await api.getObject(link.to)
            dispatch(addViewNote(note))
        }
    }
}
