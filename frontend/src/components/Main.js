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
    const [wikiSlug, setWikiSlug] = useState(query.get("w"));
    const [pageSlug, setPageSlug] = useState(query.get("p"));
    const [pages, setPages] = useState([]);
    const [pageCreateModalShow, setPageCreateModalShow] = useState(false);

    function pageForSlug(pageSlug) {
      return pages.filter((p) => p.slug === pageSlug)[0]
    }

    function updateUrlBar(newWikiSlug, newPageSlug) {
      var baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`
      const queryString = `w=${newWikiSlug}&p=${newPageSlug}`;
      const newUrl = `${baseUrl}?${queryString}`
      window.history.pushState({path: newUrl},'',newUrl);
    }

    function handleWikiChange(newWikiSlug) {
      setWikiSlug(newWikiSlug)
      updateUrlBar(newWikiSlug, pageSlug)
    }

    function handlePageChange(newPageSlug) {
      setPageSlug(newPageSlug)
      updateUrlBar(wikiSlug, newPageSlug)
    }

    function handlePageCreate(newPageSlug) {
      setPageCreateModalShow(!pageCreateModalShow)
      handlePageChange(newPageSlug)
    }

    var wikiList = null; var content = null
    if (props.api.isLoggedIn()) {
      wikiList = <WikiList handleWikiChange={handleWikiChange} wikiSlug={wikiSlug} api={props.api} />
        if (wikiSlug !== null) {
          var pageTree = <PageTree wikiSlug={wikiSlug} pageSlug={pageSlug} pages={pages} setPages={setPages} handlePageChange={handlePageChange} api={props.api}/>
          var pageContent = <PageContent wikiSlug={wikiSlug} page={pageForSlug(pageSlug)} api={props.api} editMode={editMode} />
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
      <div className="main-container">
        <div className="row">
          <div className="d-flex justify-content-between header-section p-0">
            <div className="p-2">
            <h3 id="app-name">Secret Wiki</h3>
            </div>
            { wikiList }
            <Status editMode={editMode} setEditMode={setEditMode}/>
          </div>
        </div>
      { content }
      <PageCreateModal wikiSlug={wikiSlug}
                       api={props.api}
                       shouldShow={pageCreateModalShow}
                       handlePageCreate={handlePageCreate}/>
      </div>
    )
}

export default Main;
