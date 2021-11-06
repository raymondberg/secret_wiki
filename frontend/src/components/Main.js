import { useMemo, useState } from "react";
import PageCreateModal from "./PageCreateModal";
import PageContent from "./PageContent";
import PageTree from "./PageTree";
import WikiList from "./WikiList";
import { useLocation } from "react-router-dom";

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

function Main() {
    let query = useQuery();

    const [wikiId, setWikiId] = useState(query.get("w"));
    const [pageId, setPageId] = useState(query.get("p"));
    const [pageCreateModalShow, setPageCreateModalShow] = useState(false);

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
      setPageCreateModalShow(!this.state.pageCreateModalShow)
      handlePageChange(newPageId)
    }

    return (
      <div id="main-container" className="container">
        <div className="row">
          <div className="d-flex justify-content-between header-section p-0">
            <div className="p-2">
              <h3>Secret Wiki</h3>
            </div>
            <WikiList handleWikiChange={handleWikiChange} />
            <div id="status" className="p-2"></div>
          </div>
        </div>
        { wikiId ? (
          <div className="row">
            <div id="left-bar" className="col-md-3">
              <div id="add-new">
                <PageTree wikiId={wikiId} pageId={pageId} handlePageChange={handlePageChange}/>
                <button onClick={handlePageCreate} className="page-gutter btn btn-primary"/>
              </div>
            </div>
            <div className="col-md-9">
              <PageContent wikiId={wikiId} pageId={pageId}/>
            </div>
          </div>
        ) : null }
      <PageCreateModal wikiId={wikiId}
                       shouldShow={pageCreateModalShow}
                       handlePageCreate={handlePageCreate}/>
      </div>
    )
}

export default Main;
