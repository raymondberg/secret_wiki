function unimportant_unique_id() {
  var array = new Uint32Array(4);
  window.crypto.getRandomValues(array);
  return "uu"+array.join("")
}

function jsonUnescape(str)  {
  return str.replace(/\\\\n/g, "\n").replace(/\\\\r/g, "\r").replace(/\\\\t/g, "\t");
}

function logout() {
  $.ajax({
     type: "POST",
     url: "/api/auth/cookie/logout",
     action: "POST",
  })
  .always(function() { window.location.replace('/login') })
}

function checkLogin(){
  $.ajax({
     url: "/api/users/me"
  })
   .done(function(result) {
     var status = $("#status")
     status.empty()

     status.append(
       $("<div>").append("Edit Mode: ").append(
         $("<input>")
          .attr("id", "edit-mode-toggle")
          .attr("type", "checkbox")
          .attr("checked", edit_mode_enabled)
          .click(toggleEditMode)
       )
     )
     .append(
       $("<div>")
         .addClass("text-end")
         .append(
           $("<a>")
             .addClass("header-link")
             .attr("href", "#")
             .click(logout)
             .text("Logout")
       )
     )

   })
   .fail(function(result) {
     window.location.replace('/login')
   })
}

function toggleEditMode() {
  edit_mode_enabled = ! edit_mode_enabled
  $("edit-mode-toggle").attr("checked", edit_mode_enabled)
}

$( document ).ready(function() {
  user = checkLogin()
  loadWikis()

  wikiId = $.urlParam('w');
  preservedPageId = $.urlParam('p');
  pageLoadWiki()

  pageId = preservedPageId;
  pageLoadPage()

  $('#newPageModal').on('shown.bs.modal', function() {
      $('#new-page-title-input').trigger('focus');
  });
});
