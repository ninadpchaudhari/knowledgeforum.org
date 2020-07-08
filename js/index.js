$(document).ready(function(){

  $('#loginForm').on("submit", function(e){
    e.preventDefault();
    var uname = document.getElementById("uname").value;
    var pwd = document.getElementById("pwd").value;
    test();
    return false;
  })

});

var userRegistrationData = [];

// retrieves authorization token for user from specified server
function postLogin(uname, pwd, url){
  var request = new XMLHttpRequest();

  request.open('POST', url + 'auth/local');
  request.setRequestHeader('Content-Type', 'application/json');

  request.onreadystatechange = function () {
    if (this.readyState === 4) {
      console.log('Status:', this.status);
      console.log('Headers:', this.getAllResponseHeaders());
      console.log('Body:', this.responseText);

      var data = JSON.parse(this.responseText);

      if(this.status == 200){
         userRegistrationData.push({status:this.status, token:data.token});
      } else {
         userRegistrationData.push({status:this.status, message:data.message});
      }
    }
  };

  var body = {
    'userName': uname,
    'password': pwd
  };

  request.send(JSON.stringify(body));
}

async function test(userRegistrationData){
  console.log(userRegistrationData);
  await postLogin(document.getElementById("uname").value, document.getElementById("pwd").value, "https://kf6-stage.ikit.org/");
  console.log(userRegistrationData);

}
