import { useState } from "react";
import PageCreateModal from "./pages/CreateModal";
import PageContent from "./pages/Content";
import WikiList from "./pages/WikiList";
import UserActions from "./UserActions";

import { useQuery } from "./url";
import { useSelector, useDispatch } from "react-redux";
import { updatePageBySlug, updateWikiBySlug } from "../shared/wikiSlice";
import allDefined from "../common.js";

function Main(props) {
  const [editMode, setEditMode] = useState(false);
  const [pageCreateModalShow, setPageCreateModalShow] = useState(false);
  const wikis = useSelector((state) => state.wiki.wikis);
  const pages = useSelector((state) => state.wiki.pages);
  const activeWiki = useSelector((state) => state.wiki.wiki);
  const activePage = useSelector((state) => state.wiki.page);
  const dispatch = useDispatch();
  const query = useQuery();

  function updateUrlBar() {
    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const wikiSlug = activeWiki?.slug || "";
    const pageSlug = activePage?.slug || "";
    const queryString = `w=${wikiSlug}&p=${pageSlug}`;
    const newUrl = `${baseUrl}?${queryString}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  }

  if (
    allDefined(wikis, query.get("w")) &&
    activeWiki === null &&
    wikis.length !== 0
  ) {
    // We have no wiki, but one is specified in url and we have wikis
    const wikiSlug = query.get("w");
    dispatch(updateWikiBySlug(wikiSlug));
  }
  if (
    allDefined(activeWiki, pages, query.get("p")) &&
    activePage === null &&
    pages.length !== 0
  ) {
    // We have no page, but one is specified in url and we have pages
    const pageSlug = query.get("p");
    setTimeout(() => {
      dispatch(updatePageBySlug(pageSlug));
    }, 500);
  }

  if (
    activeWiki?.slug !== query.get("w") ||
    activePage?.slug !== query.get("p")
  ) {
    updateUrlBar(activeWiki?.slug, activePage?.slug);
  }

  let content = null;
  if (props.api.isLoggedIn() && activeWiki !== null) {
    content = (
      <PageContent
        page={activePage}
        api={props.api}
        editMode={editMode}
        setPageCreateModalShow={setPageCreateModalShow}
      />
    );
  }

  return (
    <div className="main-container">
      <div className="row">
        <div className="d-md-flex justify-content-md-between header-section p-0">
          <div className="p-2">
            <h3 id="app-name">Secret Wiki</h3>
          </div>
          {props.api.isLoggedIn && <WikiList api={props.api} />}
          <UserActions
            api={props.api}
            editMode={editMode}
            setEditMode={setEditMode}
          />
        </div>
      </div>
      {content}
      <PageCreateModal
        api={props.api}
        handleClose={() => setPageCreateModalShow(false)}
        shouldShow={pageCreateModalShow}
      />
    </div>
  );
}

export default Main;
