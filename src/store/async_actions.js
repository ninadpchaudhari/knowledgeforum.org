import * as api from './api.js'

export const updateViewLink = (link) => async (dispatch, getState) => {
    await api.putLink(link._id, link);
}
