/*
* EDIT AVAILABLE SERVERS HERE
* {name:"SERVER NAME", url:"SERVER URL"}
*/
const SERVERS = [
  {name:"IKIT Stage", url:"https://kf6-stage.ikit.org/"},
  {name:"Albany Stage", url:"https://kf6-stage.rit.albany.edu/"},
  {name:"IKIT", url:"https://kf6.ikit.org/"},
  {name:"Albany", url:"https://kf6.rit.albany.edu/"},
  {name:"Singapore", url:"https://kf.rdc.nie.edu.sg/"},
  {name:"Local", url:"http://localhost:9000/"}
];

// Helper function to retrieve a servers name from its URL
function getServerName(url){
  for(i in SERVERS){
    if(SERVERS[i].url == url){ return SERVERS[i].name; }
  }

  return "Error: server " + url + " does not exist";
}


// Helper function to retrieve a servers URL from its name
function getServerURL(name){
  for(i in SERVERS){
    if(SERVERS[i].name == name){ return SERVERS[i].url; }
  }

  return "Error: server " + name + " does not exist";
}


// Helper function to retrieve the current users token for a specified server
function extractTokenFromStorage(server) {
  var uname = localStorage.getItem("Username");
  var data = JSON.parse(localStorage.getItem(uname));

  for (i in data) {
    if (data[i][0] == server) {
      return data[i][1];
    }
  }
}
