/*
* EDIT AVAILABLE SERVERS HERE
* {name:"SERVER NAME", url:"SERVER URL"}
*/
const SERVERS = [
  {name:"IKIT Stage", url:"https://kf6-stage.ikit.org/"},
  {name:"Albany Stage", url:"https://kf6-stage.rit.albany.edu/"},
  {name:"IKIT", url:"https://kf6.ikit.org/"},
  {name:"Albany", url:"https://kf6.rit.albany.edu/"},
  {name:"Singapore", url:"https://kf.rdc.nie.edu.sg/"}
];

// Helper function to retrieve a servers name from its URL
function getServerName(url){
  for(i in SERVERS){
    if(SERVERS[i].url == url){ return SERVERS[i].name; }
  }

  return "Error: server does not exist";
}

// Helper function to retrieve a servers URL from its name
function getServerURL(name){
  for(i in SERVERS){
    if(SERVERS[i].name == name){ return SERVERS[i].url; }
  }

  return "Error: server does not exist";
}
