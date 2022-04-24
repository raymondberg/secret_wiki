import React from "react";
import PageLink from "./Link";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePages, updatePageBySlug } from "../../shared/wikiSlice";
import { wikiUrl } from "../../common.js";

export default function PageTree(props) {
  const wiki = useSelector((state) => state.wiki.wiki);
  const pages = useSelector((state) => state.wiki.pages);
  const activePage = useSelector((state) => state.wiki.page);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (wiki?.slug === undefined) return;

    props.api
      .get(`w/${wiki.slug}/p`)
      .then((res) => res.json())
      .then(
        (returnedPages) => {
          if (Array.isArray(returnedPages)) {
            dispatch(updatePages(returnedPages));
            setError(null);
          } else {
            setError("Invalid response");
          }
        },
        (e) => {
          setError("Error in response " + e);
        }
      );
  }, [wiki?.last_probe_time, wiki?.slug, props.api, dispatch]);

  function pagesOrError() {
    if (error !== null) {
      return error;
    } else {
      return pages.map(linkRender);
    }
  }
  function linkRender(page) {
    return (
      <PageLink
        key={page.id}
        page={page}
        isActive={activePage?.id !== undefined && page.id === activePage.id}
        gotoPage={(p) => dispatch(updatePageBySlug(p))}
      />
    );
  }

  return (
    <div id="wiki-list" className="p-2">
      {pagesOrError()}
      <hr />
      <PageLink
        key="builtin-help-page"
        page={{ is_secret: false, title: "Wiki Guide" }}
        isActive={activePage?.id === undefined}
        gotoPage={(p) => (window.location.href = wikiUrl())}
      />
    </div>
  );
}
