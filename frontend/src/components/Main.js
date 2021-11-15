import { useMemo, useState } from "react";
import PageCreateModal from "./PageCreateModal";
import LoginModal from "./LoginModal";
import PageContent from "./PageContent";
import PageTree from "./PageTree";
import WikiList from "./WikiList";
import { useLocation } from "react-router-dom";

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function Main() {
    const crossDomain = process.env.NODE_ENV !== 'production'
    const apiRoot = (!crossDomain)? "/api": "http://localhost:8000/api"
    let query = useQuery();

    const [jwt, setJwt] = useState(null);

    const [wikiId, setWikiId] = useState(query.get("w"));
    const [pageId, setPageId] = useState(query.get("p"));
    const [pageCreateModalShow, setPageCreateModalShow] = useState(false);

    function updateUrlBar(newWikiId, newPageId) {
      var baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`
      const queryString = `w=${newWikiId}&p=${newPageId}`;
      const newUrl = `${baseUrl}?${queryString}`
      window.history.pushState({path: newUrl},'',newUrl);
    }

    function apiWrapper() {
      function get(url) {
        if (jwt === null ) {
          console.log('tried request without jwt')
        }
        var headers = {
          crossDomain: crossDomain,
          Authorization: `Bearer ${jwt}`
        }

        return fetch(`${apiRoot}/${url}`, {
          headers: headers,
        })
      }

      function post(url, body, includeBearer=true) {
        var headers = {
          crossDomain: crossDomain,
        }

        var postBody = null
        if (includeBearer) {
          headers.Authorization = `Bearer ${jwt}`
          headers['Content-Type'] = 'application/json'
          postBody = JSON.stringify(body)
        } else {
          headers['Content-Type'] = 'application/x-www-form-urlencoded'
          postBody = Object.keys(body).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(body[key])).join('&')
        }

        return fetch(`${apiRoot}/${url}`, {
          method: 'POST',
          headers: headers,
          body: postBody,
        })
      }
      return {get: get, post: post}
    }

    function handleWikiChange(newWikiId) {
      console.log("Loading new wiki " + newWikiId)
      setWikiId(newWikiId)
      updateUrlBar(newWikiId, pageId)
    }

    function handlePageChange(newPageId) {
      console.log("Loading new page " + newPageId)
      setPageId(newPageId)
      updateUrlBar(wikiId, newPageId)
    }

    function handlePageCreate(newPageId) {
      setPageCreateModalShow(!pageCreateModalShow)
      handlePageChange(newPageId)
    }

    var wikiList = null; var pageTree = null
    var api = apiWrapper()
    if (jwt !== null) {
      wikiList = <WikiList handleWikiChange={handleWikiChange} api={api} />
        if (wikiId !== null) {
          pageTree = (
            <div className="row">
              <div id="left-bar" className="col-md-3">
                <div id="add-new">
                  <PageTree wikiId={wikiId} pageId={pageId} handlePageChange={handlePageChange} api={api}/>
                  <button onClick={handlePageCreate} className="page-gutter btn btn-primary"/>
                </div>
              </div>
              <div className="col-md-9">
                <PageContent wikiId={wikiId} pageId={pageId} api={api} />
              </div>
            </div>
          )
        }
    }

    return (
      <div id="main-container" className="container">
        <div className="row">
          <div className="d-flex justify-content-between header-section p-0">
            <div className="p-2">
              <h3>Secret Wiki</h3>
            </div>
            { wikiList }
            <div id="status" className="p-2"></div>
          </div>
        </div>
      { pageTree }
      <PageCreateModal wikiId={wikiId}
                       api={api}
                       shouldShow={pageCreateModalShow}
                       handlePageCreate={handlePageCreate}/>
      <LoginModal wikiId={wikiId}
                       api={api}
                       shouldShow={jwt === null}
                       setJwt={setJwt}/>
      </div>
    )
}

export default Main;
