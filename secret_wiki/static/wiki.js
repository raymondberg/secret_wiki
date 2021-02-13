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
      $("<div/>")
        .addClass('page-section-wrapper row')
        .attr("id", `page-section-wrapper-id-${section.id}`)
    )
    replaceWithSectionDisplay(section.id, section.content)
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

function replaceWithSectionDisplay(sectionId, content) {
    console.log(`Unloading ${sectionId} with content=(${content})`)
    $(`#page-section-wrapper-id-${sectionId}`)
      .empty()
      .removeClass("data-entry")
      .append(
        $("<div/>")
          .addClass('page-section col-xs-12')
          .attr("id", `page-section-id-${sectionId}`)
          .attr("data-markdown", content)
          .html(marked(content))
      )
      .one("dblclick", function () {
        replaceWithTextBox(sectionId)
      })
}

function replaceWithTextBox(sectionId) {
  console.log("Loading " + sectionId)
  wrapper = $(`#page-section-wrapper-id-${sectionId}`)
  box = $(`#page-section-id-${sectionId}`)
  if(! wrapper.hasClass("data-entry")) {
    wrapper
      .empty()
      .addClass("data-entry")
      .append(
        $("<div/>")
          .addClass("col-md-10")
          .append(
            $("<textarea/>")
              .text(box.data("markdown"))
              .attr("id", `page-section-id-${sectionId}`)
              .attr("rows", (box.data("markdown").match(/\n/g) || []).length + 1)
            )
      )
      .append(
        $("<div/>")
          .addClass("col-md-2")
          .append(
            $("<input/>")
              .addClass("btn btn-primary section-button")
              .attr("value", "Save")
              .click(function () { saveSectionAndReset(sectionId) })
          )
          .append(
            $("<input/>")
              .addClass("btn btn-light section-button")
              .attr("value", "Cancel")
              .click(function () { closeSection(sectionId) })
          )
      )
  }
}

function closeSection(sectionId) {
  input_box = $(`#page-section-id-${sectionId}`)
  replaceWithSectionDisplay(sectionId, input_box.val())
}

function jsonUnescape(str)  {
  return str.replace(/\\\\n/g, "\n").replace(/\\\\r/g, "\r").replace(/\\\\t/g, "\t");
}

function saveSectionAndReset(sectionId) {
  input_box = $(`#page-section-id-${sectionId}`)
  content = input_box.val()
  $.ajax({
    type: "PATCH",
    url: `api/w/${wikiId}/p/${pageId}/s/${sectionId}`,
    data: JSON.stringify({
        id: sectionId,
        wiki_id: wikiId,
        page_id: pageId,
        content: content,
    }),
    dataType: "json"
  })
   .done(function(result) { replaceWithSectionDisplay(sectionId, jsonUnescape(result.content)) })
   .fail(function (result) { alert("Error: " + result.statusText)})
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
        .text(wiki.id)
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
