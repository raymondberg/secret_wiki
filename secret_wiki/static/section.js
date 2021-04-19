function makeGutter() {
  let gutterId = unimportant_unique_id()
  element = $("<div/>")
        .addClass('page-section-gutter')
        .attr("id", `gutter-${gutterId}`)
        .click( function() { replaceGutterWithTextBox(gutterId) })
  return element
}

function closeSection(sectionId) {
  inputBox = $(`#page-section-id-${sectionId}`)
  isAdminOnly = $("#page-section-is-admin-only").prop("checked")
  console.log(isAdminOnly)
  replaceWithSectionDisplay(sectionId, inputBox.val(), isAdminOnly)
}

function destroySection(sectionId) {
  gutter = makeGutter()
  wrapper.replaceWith(gutter)
}

function makeRoomAndGetIndex(object) {
  maxBefore = -1
  needingFanout = []
  minAfter = 999999999999999999999
  lookingForObject = true
  $(".page-section").each((index, obj) => {
    obj = $(obj)
    if (obj.attr("id") == object.attr("id")) {
      lookingForObject = false
    } else if (lookingForObject) {
      maxBefore = Math.max(maxBefore, obj.data("section-index"))
    } else {
      minAfter = Math.min(minAfter, obj.data("section-index"))
      if (obj.data("section-index") <= maxBefore + 2 || obj.data("section-index") < 2) {
        needingFanout.push(obj)
      }
    }
  })

  console.log(needingFanout, maxBefore, minAfter)
  needingFanout.forEach((obj, idx) => {pushSectionIndex(obj, idx)})
  object.data("section-index", maxBefore + 1)
  return object.data("section-index")
}

function pushSectionIndex(object, index) {
  $.ajax({
    type: "PATCH",
    url: `api/w/${wikiId}/p/${pageId}/s/${object.data("id")}`,
    data: JSON.stringify({
      section_index: object.data("section-index") + 2 + index
    }),
    dataType: "json"
  })
}

function receivePageSections(sectionList) {
  var contentContainer = $("#content")
  clearPage()
  itemsReceived = 0
  sectionList.forEach(function (section) {
    itemsReceived += 1
    contentContainer.append(
      $("<div/>")
        .addClass('page-section-wrapper row')
        .attr("id", `page-section-wrapper-id-${section.id}`)
    )
    replaceWithSectionDisplay(section.id, section.content, section.is_admin_only, section.section_index,)
  })
  if(itemsReceived == 0) {
    contentContainer.append(makeGutter())
  }
}

function replaceGutterWithTextBox(gutterId){
  $(`#gutter-${gutterId}`).replaceWith(
    $("<div/>")
      .addClass('page-section-wrapper row')
      .attr("id", `page-section-wrapper-id-${gutterId}`)
      .append(
        $("<div/>")
          .addClass('page-section col-xs-12')
          .attr("id", `page-section-id-${gutterId}`)
          .attr("data-markdown", "")
      )
  )
  replaceWithTextBox(gutterId, true)
}

function replaceWithSectionDisplay(sectionId, content, isAdminOnly=false, sectionIndex=0, renameSectionId=null) {
    wrapper = $(`#page-section-wrapper-id-${sectionId}`)
    wrapper
      .empty()
      .removeClass("data-entry")
      .append(
        $("<div/>")
          .addClass('page-section col-xs-12')
          .attr("id", `page-section-id-${sectionId}`)
          .attr("data-id", sectionId)
          .attr("data-markdown", content)
          .attr("data-section-index", sectionIndex)
          .attr("data-section-is-admin-only", isAdminOnly)
          .html(marked(content))
      )
      .one("dblclick", function () {
        replaceWithTextBox(sectionId)
      })

    if(!wrapper.prev().hasClass("page-section-gutter")) { makeGutter().insertBefore(wrapper) }
    if(!wrapper.next().hasClass("page-section-gutter")) { makeGutter().insertAfter(wrapper) }

    if (renameSectionId) {
      $(`#page-section-wrapper-id-${sectionId}`).attr("id", renameSectionId)
      $(`#page-section-id-${sectionId}`).attr("id", renameSectionId)
    }
}

function replaceWithTextBox(sectionId, cancelDestroys=false) {
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
              .addClass("page-section")
              .attr("id", `page-section-id-${sectionId}`)
              .attr("rows", (box.data("markdown").match(/\n/g) || []).length + 1)
              .attr("data-id", sectionId)
              .attr("data-markdown", box.data("markdown"))
              .attr("data-section-index", box.data("section-index"))
              .attr("data-section-is-admin-only", box.data("section-is-admin-only"))
              .text(box.data("markdown"))
            )
      )
      .append(
        $("<div/>")
          .addClass("col-md-2")
          .append(
            $("<div/>")
              .text("Admin Only: ")
              .append(
                $("<input/>", {id: "page-section-is-admin-only"})
                  .prop("type", "checkbox")
                  .prop("checked", box.data("section-is-admin-only"))
              )
          )
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
              .click(function () { cancelDestroys?destroySection(sectionId):closeSection(sectionId) })
          )
      )
  }
}

function saveSectionAndReset(sectionId) {
  inputBox = $(`#page-section-id-${sectionId}`)
  content = inputBox.val()
  isAdminOnly = $("#page-section-is-admin-only").prop("checked")
  if (isNaN(sectionId)) { // The create case, we use uuids for yet-to-be-created-sections
    sectionIndex = makeRoomAndGetIndex(inputBox)
    $.ajax({
      type: "POST",
      url: `api/w/${wikiId}/p/${pageId}/s`,
      data: JSON.stringify({
          content: content,
          section_index: sectionIndex,
          is_admin_only: isAdminOnly,
      }),
      dataType: "json"
    })
     .done(function(result) {  replaceWithSectionDisplay(sectionId, jsonUnescape(result.content), result.is_admin_only, result.section_index, result.id) })
     .fail(function (result) { alert("Error: " + result.statusText)})
  } else {
    $.ajax({
      type: "PATCH",
      url: `api/w/${wikiId}/p/${pageId}/s/${sectionId}`,
      data: JSON.stringify({
          id: sectionId,
          wiki_id: wikiId,
          page_id: pageId,
          content: content,
          is_admin_only: isAdminOnly,
      }),
      dataType: "json"
    })
     .done(function(result) { replaceWithSectionDisplay(sectionId, jsonUnescape(result.content), result.is_admin_only, result.section_index) })
     .fail(function (result) { alert("Error: " + result.statusText)})
  }
}
