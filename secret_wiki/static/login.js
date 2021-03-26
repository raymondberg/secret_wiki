function hasLoginData() {
  return $("#email-input").val().length > 0 && $("#password-input").val().length > 0
}

function loginData(username="username") {
  data = {password: $("#password-input").val()}
  data[username] = $("#email-input").val()
  return data
}

function doRegister() {
  if (! hasLoginData() ) { return }
  $.ajax({
    type: "POST",
    url: "/api/auth/register",
    data: JSON.stringify(loginData(username="email")),
    dataType: "json"
  })
   .done(function(result) { doSignIn() })
   .fail(function (result) { alert("error: " + result.responseJSON.detail)})
}

function doSignIn() {
  $.ajax({
    type: "POST",
    url: "/api/auth/cookie/login",
    data: loginData(),
    dataType: "application/x-www-form-urlencoded"
  })
   .done(function(result) { window.location.replace("/") })
   .fail(function (result) {
      $("#password-input").val('')

      if (result.status == 200 ) {
        window.location.replace("/")
      }
      if (result.detail == "LOGIN_USER_NOT_VERIFIED") {
        alert("Please contact the administrator to get your account verified before proceeding");
      } else {
        alert("Error: " + result.detail)
      }
   })
}

$( document ).ready(function() {
  $("#register-button").click(doRegister)
  $("#sign-in-button").click(doSignIn)
});
