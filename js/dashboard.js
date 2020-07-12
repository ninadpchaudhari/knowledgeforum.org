$(document).ready(function() {

  document.getElementById('menu-toggle').onclick = function() {
    var div = document.getElementById('wrapper');
    if(div.className == "d-flex"){
      div.className = "d-flex toggled";
    } else {
      div.className = "d-flex";
    }
  };

});
