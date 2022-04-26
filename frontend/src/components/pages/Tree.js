import React from "react";
import { PageLink, fromObject, convertToPageLink, findParent } from "./Link";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePages, pickPageBySlug } from "../../shared/wikiSlice";
import { wikiUrl } from "../../common.js";

const MAX_NESTED_PAGE_DEPTH = 4;

function buildPageLinkData(pages) {
  let pageLinks = [];
  let pagesToSort = pages;

  let attempts = 0;
  while (pagesToSort.length > 0 && attempts <= MAX_NESTED_PAGE_DEPTH) {
    attempts += 1;
    let unplaceablePages = [];
    for (const index in pagesToSort) {
      const page = pagesToSort[index];
      if (page.parent_page_id === null) {
        pageLinks.push(convertToPageLink(page));
      } else {
        const parentObject = findParent(page.parent_page_id, pageLinks);
        if (parentObject !== undefined) {
          parentObject.children.push(convertToPageLink(page));
        } else {
          unplaceablePages.push(page);
        }
      }
    }
    pagesToSort = unplaceablePages;
  }
  // Pages with incorrect parents
  if (pagesToSort.length > 0) {
    window.alert(
      `Warning: some pages invalid/self-referencing or too-deep nesting (4 level max).\n\n Update these to avoid performance issues and remove this popup:\n\n ${pagesToSort.map(
        (p) => p.slug
      )}`
    );
    pageLinks.push(...pagesToSort.map(convertToPageLink));
  }

  return pageLinks;
}

export default function PageTree(props) {
  const wiki = useSelector((state) => state.wiki.wiki);
  const pages = useSelector((state) => state.wiki.pages);
  const activePage = useSelector((state) => state.wiki.page);
  const [error, setError] = useState(null);
  const [pageLinkData, setPageLinkData] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (Array.isArray(pages) && pages.length > 0) {
      setPageLinkData(buildPageLinkData(pages));
    }
  }, [pages]);

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
    } else if (pageLinkData !== null) {
      return pageLinkData.map((l) =>
        fromObject(l, activePage?.id, (s) => dispatch(pickPageBySlug(s)))
      );
    } else {
      return [];
    }
  }

  return (
    <div id="wiki-list" className="p-2">
      {pagesOrError()}
      <hr />
      <PageLink
        key={`builtin-help-page-for-${activePage?.id}`}
        data={{ is_secret: false, title: "Wiki Guide", children: [] }}
        activePageId={activePage?.id}
        gotoPage={(p) => (window.location.href = wikiUrl())}
      />
    </div>
  );
}
