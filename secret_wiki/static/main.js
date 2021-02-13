function unimportant_unique_id() {
  var array = new Uint32Array(4);
  window.crypto.getRandomValues(array);
  return "uu"+array.join("")
}

function jsonUnescape(str)  {
  return str.replace(/\\\\n/g, "\n").replace(/\\\\r/g, "\r").replace(/\\\\t/g, "\t");
}

$( document ).ready(function() {
  loadWikis()

  wikiId = $.urlParam('w');
  preservedPageId = $.urlParam('p');
  pageLoadWiki()

  pageId = preservedPageId;
  pageLoadPage()
});