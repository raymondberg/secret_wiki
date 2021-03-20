$( document ).ready(function() {
  $.ajax({
    url: '/api/auth/google/authorize',
    data: { authentication_backend: 'cookie', scopes: 'email' },
    success: function(result) {
      $("#google-login")
        .attr("href", result.authorization_url)
        .removeClass("d-none")
    },
  })
});
