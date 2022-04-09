import { useState } from "react";
import PageCreateModal from "./pages/CreateModal";
import PageContent from "./pages/Content";
import WikiList from "./pages/WikiList";
import UserActions from "./UserActions";
import { useQuery } from "./url";

function Main(props) {
  let query = useQuery();

  const [editMode, setEditMode] = useState(false);
  const [wikiSlug, setWikiSlug] = useState(query.get("w"));
  const [pageSlug, setPageSlug] = useState(query.get("p"));
  const [pageCreateModalShow, setPageCreateModalShow] = useState(false);

  function gotoPage(newWikiSlug, newPageSlug) {
    setWikiSlug(newWikiSlug);
    setPageSlug(newPageSlug);
    var baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const queryString = `w=${newWikiSlug}&p=${newPageSlug}`;
    const newUrl = `${baseUrl}?${queryString}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  }

  function handleWikiChange(newWikiSlug) {
    setWikiSlug(newWikiSlug);
    gotoPage(newWikiSlug);
  }

  function handlePageCreate(newPageSlug) {
    setPageCreateModalShow(false);
    gotoPage(wikiSlug, newPageSlug);
  }

  var wikiList = null;
  var content = null;
  if (props.api.isLoggedIn()) {
    wikiList = (
      <WikiList
        handleWikiChange={handleWikiChange}
        wikiSlug={wikiSlug}
        api={props.api}
      />
    );
    if (wikiSlug !== null) {
      content = (
        <PageContent
          wikiSlug={wikiSlug}
          pageSlug={pageSlug}
          api={props.api}
          gotoPage={gotoPage}
          editMode={editMode}
          setPageCreateModalShow={setPageCreateModalShow}
        />
      );
    }
  }

  return (
    <div className="main-container">
      <div className="row">
        <div className="d-md-flex justify-content-md-between header-section p-0">
          <div className="p-2">
            <h3 id="app-name">Secret Wiki</h3>
          </div>
          {wikiList}
          <UserActions
            api={props.api}
            editMode={editMode}
            setEditMode={setEditMode}
          />
        </div>
      </div>
      {content}
      <PageCreateModal
        wikiSlug={wikiSlug}
        api={props.api}
        handleClose={() => setPageCreateModalShow(false)}
        shouldShow={pageCreateModalShow}
        handlePageCreate={handlePageCreate}
      />
    </div>
  );
}

export default Main;
