function clearPage() {
  $("#content").empty()
  clearPageModal()
}

function clearPageModal() {
  $('#newPageModal').modal('hide');
  $('#new-page-title-input').val('');
  $('#new-page-slug-input').val('');
  $('#new-page-is-admin-only').prop('checked', false);
}
function createPage() {
  newPageTitle = $("#new-page-title-input").val()
  newPageId = $("#new-page-slug-input").val()
  isAdminOnly = $("#new-page-is-admin-only").prop("checked")


  $.ajax({
    type: "POST",
    url: `api/w/${wikiId}/p`,
    data: JSON.stringify({
        id: newPageId,
        title: newPageTitle,
        is_admin_only: isAdminOnly,
    }),
    dataType: "json"
  })
   .done(function(result) { pageLoadPage(wikiId, newPageId) })
   .fail(function (result) { alert("Error: " + result.statusText)})
}

function loadWikis() {
  $.ajax({
    url: 'api/w',
    type: 'get',
    dataType: 'json',
    cache: true,
    success: receiveWikis,
    async:true,
  });
}

function pageLoadPageTree() {
  $.ajax({
    url: `api/w/${wikiId}/p`,
    type: 'get',
    dataType: 'json',
    cache: true,
    success: receivePageTree,
    async:true,
  });
}

function pageLoadWiki(newWikiId) {
  wikiId = newWikiId || wikiId
  pageId = null
  clearPage()
  pageLoadPageTree()
  updateUrlBar()
}

function pageLoadPage(newWikiId, newPageId) {
  newWikiId = newWikiId || wikiId
  newPageId = newPageId || pageId

  if (newPageId && newPageId != "null" && newPageId != "false" ) {
    $.ajax({
      url: `api/w/${wikiId}/p/${newPageId}/s`,
      type: 'get',
      dataType: 'json',
      cache: true,
      success: receivePageSections,
      async:true,
    });
  }

  wikiId = newWikiId
  console.log("setting page id to " + newPageId)
  pageId = newPageId

  updateUrlBar()
  pageLoadPageTree()
}

function receivePageTree(pageList) {
  var pageTreeContainer = $("#page-tree")
  pageTreeContainer.empty() // Will eventually want to conditionally empty
  pageList.forEach(function (page) {
    pageTreeContainer.append(
      $("<a/>")
        .click(function() { pageLoadPage(page.wiki_id, page.id) })
        .addClass("tree-page")
        .text(page.title)
    )
  })
}


function receiveWikis(wikiList) {
  var wikiContainer = $("#wiki-list")
  wikiList.forEach(function (wiki) {
    wikiContainer.append(
      $("<a/>")
        .click(function() { pageLoadWiki(wiki.id) })
        .addClass("header-wiki")
        .text(wiki.id)
    )
  })
}

