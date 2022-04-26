import { useEffect, useState } from "react";
import PageCreateModal from "./pages/CreateModal";
import PageContent from "./pages/Content";
import WikiList from "./pages/WikiList";
import Search from "./pages/Search";
import UserActions from "./UserActions";

import { useSelector, useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import { pickPageBySlug, updateWikiBySlug } from "../shared/wikiSlice";
import allDefined from "../common.js";

function updateUrl(wikiSlug, pageSlug) {
  console.log("Updating url with ", wikiSlug, pageSlug);
  const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  const sanitizedWikiSlug = wikiSlug || "";
  const sanitizedPageSlug = pageSlug || "";
  const queryString = `w=${sanitizedWikiSlug}&p=${sanitizedPageSlug}`;
  const newUrl = `${baseUrl}?${queryString}`;
  window.history.pushState({ path: newUrl }, "", newUrl);
}

function Main(props) {
  const [cookies, setCookie] = useCookies(["edit_mode"]);
  const [editMode, setEditModeLocal] = useState(cookies.edit_mode === "true");
  const [pageCreateModalShow, setPageCreateModalShow] = useState(false);
  const wikis = useSelector((state) => state.wiki.wikis);
  const pages = useSelector((state) => state.wiki.pages);
  const activeWiki = useSelector((state) => state.wiki.wiki);
  const activePage = useSelector((state) => state.wiki.page);
  const activeWikiSlug = activeWiki?.slug;

  const dispatch = useDispatch();
  const searchParams = new URLSearchParams(window.location.search);

  const urlWikiSlug = searchParams.get("w");
  const urlPageSlug = searchParams.get("p");

  function setEditMode(flag) {
    setCookie("edit_mode", flag);
    setEditModeLocal(flag);
  }

  useEffect(() => {
    if (
      (allDefined(activeWikiSlug) && urlWikiSlug !== activeWikiSlug) ||
      (allDefined(activePage?.slug) && urlPageSlug !== activePage?.slug)
    ) {
      updateUrl(activeWikiSlug, activePage?.slug);
    }

    if (
      allDefined(urlWikiSlug) &&
      activeWikiSlug === undefined &&
      wikis.length !== 0
    ) {
      // We have no wiki, but one is specified in url and we have wikis
      dispatch(updateWikiBySlug(urlWikiSlug));
      return;
    }
    if (
      allDefined(activeWikiSlug, pages, urlPageSlug) &&
      activePage?.slug === undefined &&
      pages.length !== 0
    ) {
      // We have no page, but one is specified in url and we have pages
      setTimeout(() => {
        dispatch(pickPageBySlug(urlPageSlug));
      }, 100);
    }
  }, [
    wikis,
    pages,
    activeWikiSlug,
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
        // Hacky solution to prevent guide page loads during refresh/link; remove with #42
        skipGuide={urlPageSlug !== undefined}
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
