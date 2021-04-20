import { createAction, createReducer } from '@reduxjs/toolkit';
import { openDialog, closeDialog } from './dialogReducer.js'
import { preProcess, postProcess } from './kftag.service.js'
import * as api from './api.js'
import { addNotification } from './notifier.js'
import { dateFormatOptions } from './globalsReducer.js'

export const addNote = createAction('ADD_NOTE')
export const removeNote = createAction('REMOVE_NOTE')
export const editNote = createAction('EDIT_NOTE')
export const addAttachment = createAction('ADD_ATTACHMENT')
export const removeAttachment = createAction('REMOVE_ATTACHMENT')
export const setAttachments = createAction('SET_ATTACHMENTS')
export const setWordCount = createAction('SET_WORDCOUNT')
export const setLinks = createAction('SET_CONNECTIONS')
export const setRecords = createAction('SET_RECORDS')
export const removeContribAuthor = createAction('REMOVE_CONTRIB_AUTHOR')
export const addContribAuthor = createAction('ADD_CONTRIB_AUTHOR')
export const setAnnotation = createAction('SET_ANNOTATION')
export const setAnnotationsLoaded = createAction('SET_ANNOTATIONS_LOADED')
export const removeAnnotation = createAction('REMOVE_ANNOTATION')
export const setViewNotes = createAction('SET_VIEW_NOTES')
export const addViewNote = createAction('ADD_VIEW_NOTE')
export const setCheckedNotes = createAction('SET_CHECKED_NOTES')
export const updateCheckedNotes = createAction('UPDATE_CHECKED_NOTES')
export const setViewLinks = createAction('SET_VIEW_LINKS')
export const addViewLink = createAction('ADD_VIEW_LINK')
export const setBuildsOn = createAction('SET_BUILDS_ON')
export const setReferences = createAction('SET_REFERENCES')
export const setSupports = createAction('SET_SUPPORTS')
export const setRiseAboveViewNotes = createAction('SET_RISEABOVE_VIEW_NOTES')
export const setRiseAboveNotes = createAction('SET_RISEABOVE_NOTES')
export const setReadLinks = createAction('SET_READ_LINKS')
export const removeViewLink = createAction('REMOVE_READ_LINKS')
export const removeViewNote = createAction('REMOVE_VIEW_NOTE')

const initState = {attachments: {}, viewNotes: {}, checkedNotes: [], viewLinks: [], buildsOn: [], supports: [], riseAboveNotes: {}, riseAboveViewNotes: {}, readLinks: []}

export const noteReducer = createReducer(initState, {
    [addNote]: (notes, action) => {
        notes[action.payload._id] = action.payload
    },
    [removeNote]: (notes, action) => {
        delete notes[action.payload]
    },
    [editNote]: (notes, action) => {
        let note = notes[action.payload._id];
        notes[action.payload._id] = Object.assign({}, note, action.payload)
    },
    [addAttachment]: (state, action) => {
        let note = state[action.payload.noteId]
        note.attachments.push(action.payload.attachment._id)
        state.attachments[action.payload.attachment._id] = action.payload.attachment
    },
    [removeAttachment]: (state, action) => {
        let note = state[action.payload.noteId]
        note.attachments = note.attachments.filter((att) => att !== action.payload.attId)
        delete state.attachments[action.payload.attId]
    },
    [setAttachments]: (state, action) => {
        let note = state[action.payload.contribId]
        note.attachments = action.payload.attachments.map((att) => att._id)
        action.payload.attachments.forEach((att) => {
            state.attachments[att._id] = att
        })
    },
    [setWordCount]: (state, action) => {
        let note = state[action.payload.contribId]
        note.wordCount = action.payload.wc
    },
    [setLinks]: (state, action) => {
        let contrib = state[action.payload.contribId]
        if (action.payload.direction === 'from') {
            contrib.fromLinks = action.payload.links
        } else {
            contrib.toLinks = action.payload.links
        }
    },
    [setRecords]: (state, action) => {
        let note = state[action.payload.contribId]
        note.records = action.payload.records
    },
    [addContribAuthor]: (state, action) => {
        let contrib = state[action.payload.contribId]
        contrib.authors = [...contrib.authors, action.payload.author]
    },
    [removeContribAuthor]: (state, action) => {
        let contrib = state[action.payload.contribId]
        contrib.authors = contrib.authors.filter((auth) => auth !== action.payload.author)
    },
    [setAnnotation]: (state, action) => {
        let contrib = state[action.payload.contribId]
        contrib.annos[action.payload.annotation._id] = action.payload.annotation
    },
    [setAnnotationsLoaded]: (state, action) => {
        let contrib = state[action.payload.contribId]
        contrib['annotsFetched'] = action.payload.value
    },
    [removeAnnotation]: (state, action) => {
        let contrib = state[action.payload.contribId]
        delete contrib.annos[action.payload.annoId]
    },
    [setViewNotes]: (state, action) => {
        const viewNotes = {}
        for (let i in action.payload)
            viewNotes[action.payload[i]._id] = action.payload[i]
        state.viewNotes = viewNotes
    },
    [setCheckedNotes]: (state, action) => {
        state.checkedNotes = action.payload
    },
    [updateCheckedNotes]: (state, action) => {
        if (action.payload.checked) {
            state.checkedNotes.push(action.payload.noteId)
        } else {
            state.checkedNotes = state.checkedNotes.filter(id => id !== action.payload.noteId)
        }
    },
    [addViewNote]: (state, action) => {
        state.viewNotes[action.payload._id] = action.payload
    },
    [removeViewNote]: (state, action) => {
        delete state.viewNotes[action.payload._id]
    },
    [setViewLinks]: (state, action) => {
        state.viewLinks = action.payload
    },
    [addViewLink]: (state, action) => {
        const matchLink = state.viewLinks.filter((link) => link._id === action.payload._id)
        if (matchLink.length === 0){
            state.viewLinks.push(action.payload)
        } else {//update view link
            state.viewLinks = state.viewLinks.map((link) => link._id === action.payload._id ? action.payload : link);
        }
    },
    [removeViewLink]: (state, action) => {
        state.viewLinks = state.viewLinks.filter((link) => link._id !== action.payload._id)
    },
    [setBuildsOn]: (state, action) => {
        state.buildsOn = action.payload
    },
    [setReferences]: (state, action) => {
        state.references = action.payload
    },
    [setSupports]: (state, action) => {
        state.supports = action.payload
    },
    [setRiseAboveViewNotes]: (state, action) => {
        state.riseAboveViewNotes[action.payload.noteId] = [...action.payload.notes]
        // state.riseAboveViewNotes = [...state.riseAboveViewNotes, action.payload]
    },
    [setRiseAboveNotes]: (state, action) => {
        // let viewId = action.payload.viewId
        // state.riseAboveNotes[viewId] = [...action.payload.notes]
        action.payload.forEach(note => state.riseAboveNotes[note._id] = note)
    },
    [setReadLinks]: (state, action) =>{
        state.readLinks = action.payload
    }
});

const createNote = (communityId, authorId, contextMode, fromId, content) => {
    if (!content) { content = '' }
    if (contextMode && !contextMode.permission) {
        window.alert('invalid mode object')
        return
    }
    let mode = {}
    if (contextMode && contextMode.permission === 'private') {
        mode.permission = contextMode.permission;
        mode.group = contextMode.group;
        mode._groupMembers = contextMode._groupMembers;
    } else {
        mode.permission = 'protected';
        mode.group = undefined;
        mode._groupMembers = [];
    }
    let title = contextMode && contextMode.title ? contextMode.title : '';
    let status = contextMode && contextMode.status ? contextMode.status : 'unsaved';

    const newobj = {
        communityId: communityId,
        type: 'Note',
        title: title,
        /* 6.6 the default title was changed to blank by Christian */
        authors: [authorId],
        status: status,
        permission: mode.permission,
        group: mode.group,
        _groupMembers: mode._groupMembers,
        data: {
            body: contextMode && contextMode.body ? contextMode.body : ''
        },
        buildson: fromId,
        langInNote: []

    }

    //save google document id, createdBy and coauthors, current doc permission granted
    if (contextMode && contextMode.docId) {
        newobj.docId = contextMode.docId;
        var myself = newobj.authors[0];
        if (contextMode.coauthors) {
            var ca = contextMode.coauthors.split(',');
            for (var i = 0; i < ca.length; i++) {
                if (ca[i] !== myself) {
                    newobj.authors.push(ca[i]);
                }
            }
        }
        if (contextMode.createdBy) {
            newobj.createdBy = contextMode.createdBy;
        }
        newobj.docShared = [myself];
        newobj.text4search = contextMode.text4search;
    }

    return newobj
}

export const newNote = (view, communityId, authorId, buildson) => dispatch => {
    const mode = { permission: view.permission, group: view.group, _groupMembers: view._groupMembers }

    const newN = createNote(communityId, authorId, mode, buildson)

    return api.postContribution(communityId, newN).then((res) => {
        const note = {
            attachments: [],
            fromLinks: [],
            toLinks: [],
            records: [],
            annos: {},
            group: null,
            ...res.data
        }
        const pos = { x: 100, y: 100 }

        if (!buildson) {
            api.postLink(view._id, note._id, 'contains', pos)
        }
        //TODO saveContainsLinktoITM x2

        dispatch(addNote(note))

        dispatch(openDialog({
            title: 'New Note',
            confirmButton: 'create',
            contribId: note._id,
            type: 'Note',
            editable: true, // new note should open in write tab
        }))
    })

}

export const newDrawing = (viewId, communityId, authorId) => async dispatch => {

    const newobj = {
        communityId: communityId,
        type: 'Drawing',
        title: 'a Drawing',
        authors: [authorId],
        status: 'unsaved',
        permission: 'protected',
        data: {
            // eslint-disable-next-line
            svg: '<svg width="200" height="200" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><g><title>Layer 1<\/title><\/g><\/svg>',
        }
    }

    const drawing = (await api.postContribution(communityId, newobj)).data

    api.postLink(viewId, drawing._id, 'contains', {x: 100, y:100, showInPlace: true})
    //TODO save contains link to ITM
    const contrib = {records: [], ...drawing}

    dispatch(addNote(contrib))

    dispatch(openDialog({
        title: 'New Drawing',
        confirmButton: 'create',
        contribId: contrib._id,
        type: 'Drawing',
        editable: true, // new note should open in write tab
    }))
}

export const buildOnNote = (noteId) => (dispatch, getState )=> {
    const state = getState()
    dispatch(newNote(state.globals.view, state.globals.communityId, state.globals.author._id, noteId))
}


export const attachmentUploaded = (noteId, attachment, inline, x, y) => dispatch => {

    return api.postLink(noteId, attachment._id, 'attach').then((res) => {

        // TODO dispatch(getLinksFrom(noteId))
        dispatch(addAttachment({ noteId, attachment }))

    });
}

export const fetchAttachments = (contribId) => async dispatch => {
    const link_atts = await api.getLinks(contribId, 'from', 'attach')
    const attachments = await Promise.all(link_atts.map((attach) => api.getObject(attach.to)))
    dispatch(setAttachments({ contribId, attachments }))
}

export const postContribution = (contrib, dialogId) => async (dispatch, getState) => {
    contrib = Object.assign({}, contrib)
    contrib.data = Object.assign({}, contrib.data)
    if (!contrib.title) {
        addNotification({ title: 'Error Saving Note!', type: 'danger', message: 'Title is required' })
        return
    }
    //TODO sync checking?
    //TODO status.contribution = 'saving'
    if (contrib.type === 'Note') {
        // TODO if isGoogleDoc
        // const isNewNote = contrib.status === 'unsaved'
        const wasActive = contrib.status === 'active'
        contrib.status = 'active'
        const jq = await postProcess(contrib.data.body, contrib._id, contrib.toLinks, contrib.fromLinks)

        const text = jq.html()
        const prev_text = contrib.data.body
        contrib.data.body = text
        const newNote = await api.putObject(contrib, contrib.communityId, contrib._id)
        newNote.data.body = prev_text
        dispatch(editNote(newNote))
        dispatch(addViewNote(newNote))

        dispatch(fetchLinks(contrib._id, 'from'))
        dispatch(fetchLinks(contrib._id, 'to'))
        if (dialogId !== undefined)
            dispatch(closeDialog(dialogId))
        if (!wasActive) //To update builds on hierarchy
            dispatch(fetchBuildsOn(newNote.communityId))
    } else {
        contrib.status = 'active'
         await api.putObject(contrib, contrib.communityId, contrib._id)
        if (dialogId !== undefined){
            dispatch(closeDialog(dialogId))
            dispatch(removeNote(contrib._id))
        }
    }

    addNotification({ title: 'Saved!', type: 'success', message: 'Contribution updated!' })
}

export const fetchLinks = (contribId, direction) => async (dispatch) => {
    const links = await api.getLinks(contribId, direction)
    dispatch(setLinks({ contribId, direction, links }))

    if (direction === "to"){
        const viewLink = links.filter((link) => link.type === "contains")[0];
        dispatch(addViewLink(viewLink));
    }
}

export const fetchRecords = (contribId) => async (dispatch, getState) => {
    const authors = getState().users
    const records = await api.getRecords(contribId)
    const formatter = new Intl.DateTimeFormat('default', dateFormatOptions)
    records.forEach((record) => {
        if (authors[record.authorId]) {
            const author = authors[record.authorId]
            record['author'] = `${author.firstName} ${author.lastName}`
        } else {
            record['author'] = 'NA'
        }
        record['date'] = formatter.format(new Date(record.timestamp))
    })
    dispatch(setRecords({ contribId, records }))
}

export const openContribution = (contribId) => async (dispatch, getState) => {

    const contrib = await api.getObject(contribId)
    const author = getState().globals.author;
    if (contrib.type === 'Note'){
        const [fromLinks, toLinks] = await Promise.all([
            api.getLinks(contribId, 'from'),
            api.getLinks(contribId, 'to')])
        const note = { attachments: [], fromLinks, toLinks, records: [], annos: {}, ...contrib }
        const noteBody = preProcess(note.data.body, toLinks, fromLinks)
        note.data.body = noteBody

        dispatch(addNote(note))
        dispatch(fetchAttachments(contribId))
        dispatch(openDialog({
            title: 'Edit Note',
            confirmButton: 'edit',
            contribId: note._id,
            type: 'Note',
            editable: author && (note.authors.includes(author._id) || author.role === "manager"), // read or write tab
            buildOn: true
        }))
        //annotations
        const annoLinks = toLinks.filter((link) => link.type === 'annotates')

        const annotations = await Promise.all(
            annoLinks.map((annLink) =>
                api.getObject(annLink.from).then(anno => {
                    anno.data.linkId = annLink._id
                    anno.data.modelId = anno._id
                    return anno
                })
            )
        )

        annotations.forEach((annot) => dispatch(setAnnotation({ annotation: annot, contribId })))
        dispatch(setAnnotationsLoaded({ contribId, value: 1 }))
    }else {
        const attachment = { records: [],  ...contrib }
        dispatch(addNote(attachment))

        dispatch(openDialog({
            title: `Edit ${contrib.type}`,
            confirmButton: 'edit',
            contribId: contrib._id,
            type: contrib.type,
            editable: author && (contrib.authors.includes(author._id) || author.role === "manager"), // read or write tab
            buildOn: true
        }))
    }
    console.log(contrib)

    if (contrib.status === 'active') {
        api.read(contrib.communityId, contrib._id)
    }
    return;
}

export const createAnnotation = (communityId, contribId, authorId, annotation) => async (dispatch) => {
    const newobj = {
        communityId: communityId,
        type: 'Annotation',
        title: 'an Annotation',
        authors: [authorId],
        status: 'active',
        permission: 'private',
        data: annotation
    };
    const ann = await api.postContribObject(communityId, newobj)

    const link = await api.postLink(ann._id, contribId, 'annotates')

    annotation.linkId = link._id;
    annotation.modelId = ann._id;
    dispatch(setAnnotation({ contribId, annotation: ann }))
    // TODO save in store link
    // $scope.annoLinks[link._id] = link;
}

export const deleteAnnotation = (linkId, contribId, annoId) => async (dispatch) => {
    await api.deleteLink(linkId)
    return dispatch(removeAnnotation({ contribId, annoId }))
}

export const modifyAnnotation = (annotation, communityId, contribId) => async (dispatch) => {
    const anno_updated = await api.putObject(annotation, communityId, annotation._id)
    return dispatch(setAnnotation({ contribId, annotation: anno_updated }))
}

export const fetchViewNotes = (viewId) => async (dispatch) => {
    const links = (await api.getLinks(viewId, 'from'))
    const noteLinks = links
        .filter(obj => (obj._to.type === "Note" && obj._to.title !== "" && obj._to.status === "active"))

    dispatch(setViewLinks(links))
    const notes = await Promise.all(noteLinks.map((filteredObj) => api.getObject(filteredObj.to)))

    dispatch(setViewNotes(notes))

    //RISEABOVE
    notes.forEach(async note => {
        if (note.data && note.data.riseabove) {
            //SET NOTES INTO RISEABOVE LIST
            let viewId = note.data.riseabove.viewId
            const riseAboveNoteIds = (await api.getLinks(viewId, 'from'))
                  .filter(obj => (obj._to.type === "Note" && obj._to.title !== "" && obj._to.status === "active")).map(lnk => lnk.to)
            const riseAboveNotes = await Promise.all(riseAboveNoteIds.map((noteId) => api.getObject(noteId)))
            // let data = {
            //     viewId: viewId,
            //     notes: riseAboveNotes,
            // }

            dispatch(setRiseAboveNotes(riseAboveNotes))
            dispatch(setRiseAboveViewNotes({noteId: note._id, notes: riseAboveNoteIds}))
            // riseAboveNotes.forEach(note => dispatch(setRiseAboveViewNotes(note)))
        }
    })
}

export const fetchBuildsOn = (communityId) => async (dispatch) => {
    let buildOnResult = await api.linksSearch(communityId, { "type": "buildson" })
    buildOnResult = buildOnResult.reverse();
    const filteredBuildOn = buildOnResult.filter(
        (obj) =>
            (obj._to.type === "Note" && obj._to.status === "active" && obj._from.type === "Note" && obj._from.status === "active")
    )
    dispatch(setBuildsOn(filteredBuildOn))
}

export const fetchReferences = (communityId) => async (dispatch) => {
   let references = await api.linksSearch(communityId, {"type": "references"});
   const filteredReferences = references.filter((obj) => (obj._to.status === "active" && obj._to.title !== "" && obj._from.status === "active" && obj._from.title !== ""));
   dispatch(setReferences(filteredReferences));
}

export const fetchSupports = (communityId) => async (dispatch) => {
    let supports = await api.linksSearch(communityId, { "type": "supports" })
    dispatch(setSupports(supports))
}

export const deleteAttachment = (contribId, attId) => async (dispatch, getState) => {
    const state = getState()
    let contrib = state.notes[contribId]
    const att_link = contrib.fromLinks.filter((lnk) => lnk.to === attId)[0]
    await api.deleteLink(att_link._id)
    dispatch(removeAttachment({ attId, noteId: contribId }))
    dispatch(fetchLinks(contribId, 'from'))
}

export const fetchReadLinks = (communityId, viewId) => async (dispatch) =>{
    const readLinks = await api.getApiLinksReadStatus(communityId, viewId)
    dispatch(setReadLinks(readLinks))
}
