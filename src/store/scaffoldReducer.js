import { createAction, createReducer } from '@reduxjs/toolkit';
import * as api from './api.js'

export const requestScaffold = createAction('REQUEST_SCAFFOLD')
export const receiveScaffold= createAction('RECEIVE_SCAFFOLD')

const initState = {isFetching: false,
                   items: [],
                   fetched: false,
                  }

export const scaffoldReducer = createReducer(initState, {
    [receiveScaffold]: (state, action) => {
        state.items = action.payload
        state.isFetching = false
        state.fetched = true
    },
    [requestScaffold]: (state, action) => {
        state.isFetching = true
    }
});

export const fetchScaffolds = (communityId, contextId) => {
    return dispatch => {
        dispatch(requestScaffold)

        let scaffold_promise = api.getCommunity(communityId).then( res => {
            return Promise.all(res.data.scaffolds.map((scaffoldId) => {
                return api.getObject(scaffoldId);
            }));
        });

        return Promise.all([scaffold_promise, api.getLinks(contextId, 'from', 'uses')]).then(async res =>{
            let links = res[1].map((link) => link.to);
            let scaffolds = res[0].filter((el) => links.includes(el._id));
            /* const scaffolds = this.state.scaffolds; */
            let supports = await Promise.all(scaffolds.map((el) => api.getLinks(el._id, 'from')));
            scaffolds = scaffolds.map((scaffold, i) => {
                scaffold.supports = supports[i];
                return scaffold;
            })

            dispatch(receiveScaffold(scaffolds))
        });
    }
}
