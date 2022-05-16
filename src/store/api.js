import axios from "axios";
import Axios from "axios";

// export const url = 'https://kf6.ikit.org';
// export const url = 'https://kf6-stage.ikit.org';
export let url = localStorage.getItem("server");
export let apiUrl = `${url}/api`;

export function setServer(server) {
  //SET SERVER ON SESSION STORAGE
  if (server.endsWith("/")) {
    server = server.substring(0, server.length - 1);
  }
  localStorage.setItem("server", server);
  url = server;
  apiUrl = `${url}/api`;
  return url;
}

export function setToken(token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export const removeToken = () => {
  delete axios.defaults.headers.common.Authorization;
};

const token = sessionStorage.getItem("token");
if (token) {
  setToken(token);
}

//USER
export const getUser = async () => {
  return (await axios.get(`${apiUrl}/users/me`)).data;
};

//Contribution
export const postContribution = (communityId, obj) => {
  return axios.post(`${apiUrl}/contributions/${communityId}`, obj); //, {mode: 'cors'});
};

export const postSearchContribution = (communityId, obj) => {
  return axios.post(`${apiUrl}/contributions/${communityId}/search/`, obj); //, {mode: 'cors'});
};

//Community
export const getCommunity = (communityId) => {
  return axios.get(`${apiUrl}/communities/${communityId}`); //, {mode: 'cors'});
};

export const putCommunity = async (object, communityId) => {
  return (await axios.put(`${apiUrl}/communities/${communityId}`, object)).data;
};

export const getCommunities = async () => {
  return (await axios.get(`${apiUrl}/communities/`)).data;
};

export const getUserCommunities = async () => {
  return (await axios.get(`${apiUrl}/users/myRegistrations`)).data;
};

export const getGroups = async (communityId) => {
  return (await axios.get(`${apiUrl}/communities/${communityId}/groups`)).data;
};

export const getCommunityViews = async (communityId) => {
  return (await axios.get(`${apiUrl}/communities/${communityId}/views`)).data;
};

//Links
export const getLinks = async (objectId, direction, type) => {
  let links = await axios.get(`${apiUrl}/links/${direction}/${objectId}`);
  links = links.data;
  if (type) {
    links = links.filter(function (each) {
      return each.type === type;
    });
  }
  return links;
};

export const putLink = async (linkId, link) => {
  return (await axios.put(`${apiUrl}/links/${linkId}`, link)).data;
};
export const postLink = async (fromId, toId, type, data) => {
  return (
    await axios.post(`${apiUrl}/links`, {
      from: fromId,
      to: toId,
      type: type,
      data: data,
    })
  ).data;
};

export const deleteLink = async (linkId) => {
  return (await axios.delete(`${apiUrl}/links/${linkId}`)).data;
};

export const linksSearch = async (communityId, query) => {
  return (
    await axios.post(`${apiUrl}/links/${communityId}/search`, { query: query })
  ).data;
};

//Object
export const getObject = async (objectId) => {
  return (await axios.get(`${apiUrl}/objects/${objectId}`)).data;
};

export const putObject = async (object, communityId, objectId) => {
  return (
    await axios.put(`${apiUrl}/objects/${communityId}/${objectId}`, object)
  ).data;
};

//Record
export const read = (communityId, objectId) => {
  return axios.post(`${apiUrl}/records/read/${communityId}/${objectId}`);
};

export const postAttachment = (communityId, authorId) => {
  var newobj = {
    communityId: communityId,
    type: "Attachment",
    title: "an Attachment",
    authors: [authorId],
    status: "unsaved",
    permission: "protected",
    data: {
      version: 0,
    },
  };
  return axios.post(`${apiUrl}/contributions/${communityId}`, newobj);
};

export const postContribObject = async (communityId, obj) => {
  return (await axios.post(`${apiUrl}/contributions/${communityId}`, obj)).data;
};

//Author
export const getAuthor = (communityId) => {
  return axios.get(`${apiUrl}/authors/${communityId}/me`);
};
export const getCommunityAuthors = async (communityId) => {
  return (await axios.get(`${apiUrl}/communities/${communityId}/authors`)).data;
};

//Records
export const getRecords = async (contribId) => {
  return (await axios.get(`${apiUrl}/records/object/${contribId}`)).data;
};

export const uploadFile = (file, onProgress) => {
  var formData = new FormData();
  formData.append("file", file);
  return axios.post(`${apiUrl}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      // ...config.headers
    },
    onUploadProgress: onProgress,
  });
};

export const getLinkForObj = (objId) => {
  return axios.get(`${apiUrl}/links/either/${objId}`);
};

export const getViews = async (communityId) => {
  return (await axios.get(`${apiUrl}/communities/${communityId}/views`)).data;
};

export const postView = (query, communityId) => {
  return axios.post(`${apiUrl}/contributions/${communityId}`, query);
};

// returns a promise that on fullfillment returns an array of the read note ids only
export function getApiLinksReadStatus(communityId, viewId) {
  return axios
    .get(`${apiUrl}/records/myreadstatusview/${communityId}/${viewId}`)
    .then(function (result) {
      const body = result.data;
      var results = [];
      for (var i in body) {
        if (body[i].type === "read") {
          results.push(body[i].to);
        }
      }
      return results;
    })
    .catch(function (error) {
      return "Error:", error;
    });
}

// used to mark notes as read according to the given parameters
export function postReadStatus(communityId, contributionId) {
  return axios
    .post(`${apiUrl}/records/read/${communityId}/${contributionId}`)
    .then(function (body) {
      return body;
    })
    .catch(function (error) {
      return "Error:", error;
    });
}

//
export const fetchContribution = (viewId) => {
  var body = {
    query: {
      pagesize: "max",
      type: "Note",
    },
  };

  return axios
    .post(`${apiUrl}/contributions/56947546535c7c0709beee5c/search/`, body)
    .then((response) => {
      return response;
    });
};
