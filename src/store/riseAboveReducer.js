import { createAction, createReducer } from '@reduxjs/toolkit';
import * as api from './api.js'

export const addNote = createAction('ADD_NOTE')
const initState = {

}

export const riseAboveReducer = createReducer(initState, {});

export const createRiseAbove = (view, communityId, author, notes) => dispatch => {
    let object = {};
    let riseAboveId;
    let riseAboveNoteId;
    let viewId = view._id;
    object.authors = author.split(',')
    object.communityId = communityId;
    object.permission = view.permission ? view.permission : "public";
    object.status = "active"
    object.title = "riseabove:"
    object.type = "View"
    object._groupMembers = view._groupMembers;
    console.log("OBJECT", object);
    //CONTRIBUTE RISEABOVE VIEW
    api.postContribObject(communityId, object).then(response => {
        riseAboveId = response._id;
        console.log("Response", response);
        let note = {};
        note.authors = object.authors;
        note.buildson = null;
        note.communityId = communityId;
        note.data = { body: "" };
        note.langInNote = [];
        note.permission = "protected";
        note.status = "unsaved";
        note.title = "";
        note.type = "Note";
        note._groupMembers = view._groupMembers;
        console.log("NOTE", note);
        //CONTRIBUTE RISEABOVE NOTE
        api.postContribObject(communityId, note).then(noteResponse => {
            console.log("noteResponse", noteResponse);
            riseAboveNoteId = noteResponse._id;
            noteResponse.data = {
                body: "",
                riseabove: { viewId: `${riseAboveId}` }
            }
            noteResponse.status = "active";
            noteResponse.title = "Riseabove"
            console.log("noteResponse noteResponse", noteResponse);
            api.putObject(noteResponse, communityId, riseAboveNoteId).then(putResponse => {
                //POST API LINKS
                let pos = { x: 200, y: 200 }
                api.postLink(viewId, riseAboveNoteId, 'contains', pos).then(res => {
                    notes.forEach(note => {
                        let pos = { x: 20, y: 20 }
                        api.postLink(riseAboveId, note._id, 'contains', pos).then(res => {
                            //EITHER AND THEN DELETE
                            api.getLinkForObj(note._id).then(linkRes => {
                                let links = linkRes.data;
                                let link = links.filter(obj => {
                                    return obj.from.includes(viewId)
                                })
                                api.deleteLink(link[0]._id);
                            })
                        })
                    });
                })
            })
        }).catch(error => {
            console.log("error", error);
        })

    }).catch(error => {
        console.log("Error", error);
    });

}
