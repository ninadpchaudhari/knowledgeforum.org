/*
* EDIT AVAILABLE SERVERS HERE
* {name:"SERVER NAME", url:"SERVER URL"}
*/
const SERVERS = [
  {name:"Test", url:"https://kf6-stage.ikit.org/"},
  {name:"Albany/RIT", url:"https://kf6-stage.rit.albany.edu/"},
  {name:"Singapore", url:"https://kf.rdc.nie.edu.sg/"}
];

// Helper function to retrieve a servers name from its URL
function getServerName(url){
  for(i in SERVERS){
    if(SERVERS[i].url == url){ return SERVERS[i].name; }
  }

  return "Error: server does not exist";
}
