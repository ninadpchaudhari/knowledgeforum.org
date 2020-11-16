import { createAction, createReducer } from '@reduxjs/toolkit';
import * as api from './api.js'

export const addUser = createAction('ADD_USER')
export const addAuthors = createAction('ADD_AUTHORS')
const initState = {}
export const userReducer = createReducer(initState, {
    [addUser]: (state, action) => {
        state[action.payload._id] = action.payload
    },
    [addAuthors]: (state, action) => {
        action.payload.forEach((author) => state[author._id] = author )
    }

})

export const fetchAuthors = (communityId) => async (dispatch) => {
    const authors = await api.getCommunityAuthors(communityId)
    dispatch(addAuthors(authors))
}
