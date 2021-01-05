var wikiId = null
var pageId = null

$.urlParam = function (name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                    .exec(window.location.search);

  return (results !== null) ? results[1] || 0 : false;
}

console.log($.urlParam('action')); //edit

function extractAddress() {
  window.location.search
}
function updateUrlBar() {
  var newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?w=${wikiId}&p=${pageId}`;
  window.history.pushState({path:newUrl},'',newUrl);
}

function clearPage() {
  $("#content").empty()
}

function receivePageSections(sectionList) {
  var contentContainer = $("#content")
  clearPage()
  sectionList.forEach(function (section) {
    contentContainer.append(
      $("<div/>").addClass('page-section-wrapper').append(
        $("<div/>")
          .addClass('page-section')
          .html(marked(section.content))
      )
    )
  })
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

function receiveWikis(wikiList) {
  var wikiContainer = $("#wiki-list")
  wikiList.forEach(function (wiki) {
    wikiContainer.append(
      $("<a/>")
        .click(function() { pageLoadWiki(wiki.id) })
        .addClass("header-wiki")
        .text(wiki.name)
    )
  })
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

$( document ).ready(function() {
  loadWikis()

  wikiId = $.urlParam('w');
  preservedPageId = $.urlParam('p');
  pageLoadWiki()

  pageId = preservedPageId;
  pageLoadPage()
});
