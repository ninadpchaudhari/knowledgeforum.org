import * as api from './api.js'
import { addViewLink, addViewNote, createNote } from './noteReducer.js'

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

export const createView = async (title, authorId, communityId, options, registerToCommunity) => {
    const newobj = {
        communityId: communityId,
        type: 'View',
        title: title,
        authors: [authorId],
        status: 'active',
        permission: 'public',
        ...options
    };

    const newView = (await api.postView(newobj, communityId)).data

    if (registerToCommunity){
        const community = (await api.getCommunity(communityId)).data
        community.views.push(newView)
        api.putCommunity(community, communityId)
    }
    return newView
}

export const makeRiseabove = async (note, viewId, communityId) => {
    if (!note.data){ note.data = {}}
    note.status = 'active'
    note.data.riseabove = {viewId}

    const noteModified = await api.putObject(note, communityId, note._id)
    return noteModified
}

export const newRiseAbove = (riseAboveTitle) => async (dispatch, getState) => {

    const {author, communityId, view} = getState().globals
    const mode = {
        permission: view.permission,
        group: view.group,
        '_groupMembers':  view._groupMembers
    };

    const newView = await createView(riseAboveTitle, author._id, communityId, mode, false)

    const newNote = createNote(communityId, author._id, mode)
    //Create Note
    let note = (await api.postContribution(communityId, newNote)).data
    note.title = riseAboveTitle;

    note = await makeRiseabove(note, newView._id, communityId)

    api.postLink(view._id, note._id, 'contains', {x: 200, y: 200}) //TODO get element position

    //$community.saveContainsLinktoITM(view._id, note._id);}
}
