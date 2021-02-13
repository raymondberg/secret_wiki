var wikiId = null
var pageId = null

$.urlParam = function (name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                    .exec(window.location.search);

  return (results !== null) ? results[1] || 0 : false;
}

function extractAddress() {
  window.location.search
}
function updateUrlBar() {
  var newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?w=${wikiId}&p=${pageId}`;
  window.history.pushState({path:newUrl},'',newUrl);
}


