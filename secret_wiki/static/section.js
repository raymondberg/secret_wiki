function makeGutter() {
  let gutterId = unimportant_unique_id()
  element = $("<div/>")
        .addClass('page-section-gutter')
        .attr("id", `gutter-${gutterId}`)
        .click( function() { replaceGutterWithTextBox(gutterId) })
  return element
}

function closeSection(sectionId) {
  input_box = $(`#page-section-id-${sectionId}`)
  replaceWithSectionDisplay(sectionId, input_box.val())
}

function destroySection(sectionId) {
  gutter = makeGutter()
  wrapper.replaceWith(gutter)
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


function replaceWithSectionDisplay(sectionId, content, renameSectionId=null) {
    wrapper = $(`#page-section-wrapper-id-${sectionId}`)
    wrapper
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

    if(!wrapper.prev().hasClass("page-section-gutter")) { makeGutter().insertBefore(wrapper) }
    if(!wrapper.next().hasClass("page-section-gutter")) { makeGutter().insertAfter(wrapper) }

    if (renameSectionId) {
      $(`#page-section-wrapper-id-${sectionId}`).attr("id", renameSectionId)
      $(`#page-section--id-${sectionId}`).attr("id", renameSectionId)
    }
}

function replaceWithTextBox(sectionId, cancelDestroys=false) {
  wrapper = $(`#page-section-wrapper-id-${sectionId}`)
  box = $(`#page-section-id-${sectionId}`)
  console.log(`#page-section-id-${sectionId}`)
  console.log(box)
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
              .click(function () { cancelDestroys?destroySection(sectionId):closeSection(sectionId) })
          )
      )
  }
}

function saveSectionAndReset(sectionId) {
  input_box = $(`#page-section-id-${sectionId}`)
  content = input_box.val()
  if (isNaN(sectionId)) { // The create case, we use uuids for yet-to-be-created-sections
    $.ajax({
      type: "POST",
      url: `api/w/${wikiId}/p/${pageId}/s`,
      data: JSON.stringify({
          content: content,
      }),
      dataType: "json"
    })
     .done(function(result) { replaceWithSectionDisplay(sectionId, jsonUnescape(result.content), result.id) })
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
      }),
      dataType: "json"
    })
     .done(function(result) { replaceWithSectionDisplay(sectionId, jsonUnescape(result.content)) })
     .fail(function (result) { alert("Error: " + result.statusText)})
  }
}
