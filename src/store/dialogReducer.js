import { createAction, createReducer } from '@reduxjs/toolkit';

export const openDialog = createAction('OPEN_DIALOG');
export const closeDialog = createAction('CLOSE_DIALOG');
export const openDrawDialog = createAction('OPEN_DRAW_DIALOG')
export const closeDrawDialog = createAction('CLOSE_DRAW_DIALOG')
export const focusDialog = createAction('FOCUS_DIALOG')
export const openAttachPanel = createAction('OPEN_ATTACH_PANEL')
export const closeAttachPanel = createAction('CLOSE_ATTACH_PANEL')

let dialogCounter= 0
const defaultZIndex = 1000
const focusedZindex = 1100
//Dialog content
// dialog = {id, noteId, title, content, confirmButton, zIndex}
const initState = { dialogs: [], drawTool: null, focused: null, attachPanel: {}};
export const dialogReducer = createReducer(initState, {
    // actionCreator.toString() will automatically be called here
    [openDialog] : (state, action) => {
        //Unfocus previous focused dialog
        const dlgs = state.dialogs.map(dlg => {
            if (dlg.id === state.focused)
                dlg.zIndex = defaultZIndex
            return dlg
        })
        //Add new dialog
        state.focused = dialogCounter
        state.dialogs = [...dlgs, {id: dialogCounter++, zIndex: focusedZindex, ...action.payload}]
        //Update index of focused
        // state.dialogs.push({id: dialogCounter++, ...action.payload});
    },

    // Or, you can reference the .type field:
    [closeDialog] : (state, action) => {
        // console.log(state.dialogs)
        state.dialogs = state.dialogs.filter((dlg) => dlg.id !== action.payload)
    },

    [openDrawDialog]: (state, action) => {
        state.drawTool = action.payload;
    },

    [closeDrawDialog]: (state, action) => {
        state.drawTool = null;
    },

    [openAttachPanel]: (state, action) => {
        state.attachPanel = action.payload;
    },

    [closeAttachPanel]: (state, action) => {
        state.attachPanel = {};
    },

    [focusDialog]: (state, action) => {
        if (state.focused !== action.payload) {
            state.dialogs = state.dialogs.map( dlg => {
                if (dlg.id === state.focused)
                    dlg.zIndex = defaultZIndex
                else if (dlg.id === action.payload)
                    dlg.zIndex = focusedZindex
                return dlg
            })
            state.focused = action.payload
        }
    }
});

