import axios from 'axios';

// export const url = 'https://kf6.ikit.org';
// export const url = 'https://kf6-stage.ikit.org';
export let url = localStorage.getItem("server");
export let apiUrl = `${url}/api`;

export function setServer(server) {
    //SET SERVER ON SESSION STORAGE
    localStorage.setItem("server", server);
    url = server;
    apiUrl = `${url}/api`;
    return url;
}

export function setToken(token) {
    axios.defaults.headers.common['Authorization'] =
        `Bearer ${token}`;
}

export const removeToken = () => {
    delete axios.defaults.headers.common.Authorization
}


const token = sessionStorage.getItem('token');
if (token) {
    setToken(token)
}

//USER
export const getUser = async () => {
    return (await axios.get(`${apiUrl}/users/me`)).data
}

//Contribution
export const postContribution = (communityId, obj) => {
    return axios.post(`${apiUrl}/contributions/${communityId}`, obj);//, {mode: 'cors'});
}

//Community
export const getCommunity = (communityId) => {
    return axios.get(`${apiUrl}/communities/${communityId}`);//, {mode: 'cors'});
}

export const getCommunities = async () => {
    return (await axios.get(`${apiUrl}/communities/`)).data
}

export const getUserCommunities = async () => {
    return (await axios.get(`${apiUrl}/users/myRegistrations`)).data
}

export const getGroups = async (communityId) => {
    return (await axios.get(`${apiUrl}/communities/${communityId}/groups`)).data
}

export const getCommunityViews = async (communityId) => {
    return (await axios.get(`${apiUrl}/communities/${communityId}/views`)).data
}

//Links
export const getLinks = async (objectId, direction, type) => {
    let links = await axios.get(`${apiUrl}/links/${direction}/${objectId}`);
    links = links.data;
    if (type) {
        links = links.filter(function (each) {
            return each.type === type;
        });
    }
    return links
}

export const postLink = async (fromId, toId, type, data) => {
    return (await axios.post(`${apiUrl}/links`, { from: fromId, to: toId, type: type, data: data })).data
}

export const deleteLink = async (linkId) => {
    return (await axios.delete(`${apiUrl}/links/${linkId}`)).data
}

export const linksSearch = async (communityId, query) => {
    return (await axios.post(`${apiUrl}/links/${communityId}/search`, { "query": query })).data
}

//Object
export const getObject = async (objectId) => {
    return (await axios.get(`${apiUrl}/objects/${objectId}`)).data
}

export const putObject = async (object, communityId, objectId) => {
    return (await axios.put(`${apiUrl}/objects/${communityId}/${objectId}`, object)).data
}

//Record
export const read = (communityId, objectId) => {
    return axios.post(`${apiUrl}/records/read/${communityId}/${objectId}`)
}

export const postAttachment = (communityId, authorId) => {
    var newobj = {
        communityId: communityId,
        type: 'Attachment',
        title: 'an Attachment',
        authors: [authorId],
        status: 'unsaved',
        permission: 'protected',
        data: {
            version: 0
        }
    };
    return axios.post(`${apiUrl}/contributions/${communityId}`, newobj)
}

export const postContribObject = async (communityId, obj) => {
    return (await axios.post(`${apiUrl}/contributions/${communityId}`, obj)).data
}

//Author
export const getAuthor = (communityId) => {
    return axios.get(`${apiUrl}/authors/${communityId}/me`)
}
export const getCommunityAuthors = async (communityId) => {
    return (await axios.get(`${apiUrl}/communities/${communityId}/authors`)).data
}

//Records
export const getRecords = async (contribId) => {
    return (await axios.get(`${apiUrl}/records/object/${contribId}`)).data
}

export const uploadFile = (file, onProgress) => {
    var formData = new FormData();
    formData.append("file", file);
    return axios.post(`${apiUrl}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            // ...config.headers
        },
        onUploadProgress: onProgress,
    })
}

export const getLinkForObj = (objId) => {
    return axios.get(`${apiUrl}/links/either/${objId}`)
}

// export default {url, apiUrl, postContribution, getCommunity,
//                 getLinks, getObject, createAttachment,
//                 getAuthor, uploadFile, putObject,
//                 postLink, deleteLink, getCommunityAuthors,
//                 getRecords, read
//                }
