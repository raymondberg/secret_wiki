import { useMemo, useState } from "react";
import PageCreateModal from "./PageCreateModal";
import PageContent from "./PageContent";
import PageTree from "./PageTree";
import Status from "./Status";
import WikiList from "./WikiList";
import { useLocation } from "react-router-dom";

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function Main(props) {
    let query = useQuery();

    const [editMode, setEditMode] = useState(false);
    const [wikiId, setWikiId] = useState(query.get("w"));
    const [pageId, setPageId] = useState(query.get("p"));
    const [pages, setPages] = useState([]);
    const [pageCreateModalShow, setPageCreateModalShow] = useState(false);

    function pageForId(pageId) {
      return pages.filter((p) => p.id === pageId)[0]
    }

    function updateUrlBar(newWikiId, newPageId) {
      var baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`
      const queryString = `w=${newWikiId}&p=${newPageId}`;
      const newUrl = `${baseUrl}?${queryString}`
      window.history.pushState({path: newUrl},'',newUrl);
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

    var wikiList = null; var content = null
    if (props.api.isLoggedIn()) {
      wikiList = <WikiList handleWikiChange={handleWikiChange} api={props.api} />
        if (wikiId !== null) {
          var pageTree = <PageTree wikiId={wikiId} pageId={pageId} pages={pages} setPages={setPages} handlePageChange={handlePageChange} api={props.api}/>
          var pageContent = <PageContent wikiId={wikiId} page={pageForId(pageId)} api={props.api} editMode={editMode} />
          content = (
            <div className="row">
              <div id="left-bar" className="col-md-3">
                <div id="add-new">
                  { pageTree }
                  <button onClick={handlePageCreate} className="page-gutter btn btn-primary"/>
                </div>
              </div>
              <div className="col-md-9">
                {pageContent}
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
            <Status editMode={editMode} setEditMode={setEditMode}/>
          </div>
        </div>
      { content }
      <PageCreateModal wikiId={wikiId}
                       api={props.api}
                       shouldShow={pageCreateModalShow}
                       handlePageCreate={handlePageCreate}/>
      </div>
    )
}

export default Main;
