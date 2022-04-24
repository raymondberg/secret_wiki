import { useEffect, useState } from "react";
import PageCreateModal from "./pages/CreateModal";
import PageContent from "./pages/Content";
import WikiList from "./pages/WikiList";
import Search from "./pages/Search";
import UserActions from "./UserActions";

import { useQuery } from "./url";
import { useSelector, useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import { updatePageBySlug, updateWikiBySlug } from "../shared/wikiSlice";
import allDefined from "../common.js";

function Main(props) {
  const [cookies, setCookie] = useCookies(["edit_mode"]);
  const [editMode, setEditModeLocal] = useState(cookies.edit_mode === "true");
  const [pageCreateModalShow, setPageCreateModalShow] = useState(false);
  const wikis = useSelector((state) => state.wiki.wikis);
  const pages = useSelector((state) => state.wiki.pages);
  const activeWiki = useSelector((state) => state.wiki.wiki);
  const activePage = useSelector((state) => state.wiki.page);
  const dispatch = useDispatch();
  const query = useQuery();

  const urlWikiSlug = query.get("w");
  const urlPageSlug = query.get("p");

  function setEditMode(flag) {
    setCookie("edit_mode", flag);
    setEditModeLocal(flag);
  }

  useEffect(() => {
    if (
      (allDefined(activeWiki?.slug) && urlWikiSlug !== activeWiki?.slug) ||
      (allDefined(activePage?.slug) && urlPageSlug !== activePage?.slug)
    ) {
      const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      const sanitizedWikiSlug = activeWiki?.slug || "";
      const sanitizedPageSlug = activePage?.slug || "";
      const queryString = `w=${sanitizedWikiSlug}&p=${sanitizedPageSlug}`;
      const newUrl = `${baseUrl}?${queryString}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }

    if (
      allDefined(urlWikiSlug) &&
      activeWiki?.slug === undefined &&
      wikis.length !== 0
    ) {
      // We have no wiki, but one is specified in url and we have wikis
      dispatch(updateWikiBySlug(urlWikiSlug));
      return;
    }
    if (
      allDefined(activeWiki?.slug, pages, urlPageSlug) &&
      activePage?.slug === undefined &&
      pages.length !== 0
    ) {
      // We have no page, but one is specified in url and we have pages
      setTimeout(() => {
        dispatch(updatePageBySlug(urlPageSlug));
      }, 100);
    }
  }, [
    wikis,
    pages,
    activeWiki?.slug,
    activePage?.slug,
    urlWikiSlug,
    urlPageSlug,
    dispatch,
  ]);

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
          {props.api.isLoggedIn && <WikiList />}
          {props.api.isLoggedIn && <Search api={props.api} />}
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
