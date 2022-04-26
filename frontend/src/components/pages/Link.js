import { useState, useEffect } from "react";
import { getLock } from "../Icons";

export function convertToPageLink(page) {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    is_secret: page.is_secret,
    page: page,
    children: [],
  };
}

export function findParent(id, collection) {
  for (const index in collection) {
    const pageLink = collection[index];
    if (pageLink.id === id) {
      return pageLink;
    }
    const result = findParent(id, pageLink.children);
    if (result !== undefined) {
      return result;
    }
  }
}

export function fromObject(pageLinkObject, activePageId, gotoPage) {
  return (
    <PageLink
      key={pageLinkObject.id}
      data={pageLinkObject}
      activePageId={activePageId}
      gotoPage={gotoPage}
    />
  );
}

export function PageLink(props) {
  const [showChildren, setShowChildren] = useState(false);
  const [isActivePage, setIsActivePage] = useState(false);

  useEffect(() => {
    const shouldBeActive = props.activePageId === props.data.id;
    setIsActivePage(shouldBeActive);
    if (
      shouldBeActive ||
      findParent(props.activePageId, props.data.children) !== undefined
    ) {
      setShowChildren(true);
    }
  }, [props.activePageId, props.data.id, props.data.children]);

  const prefix =
    props.data.children.length > 0 ? (
      showChildren ? (
        <i className="gg-icon gg-chevron-down"></i>
      ) : (
        <i className="gg-icon gg-chevron-right"></i>
      )
    ) : (
      <i className="gg-icon"></i>
    );
  const lock = props.data.is_secret ? getLock() : "";

  function children() {
    if (showChildren && props.data.children.length > 0) {
      return (
        <div className="px-3">
          {props.data.children.map((l) =>
            fromObject(l, props.activePageId, props.gotoPage)
          )}
        </div>
      );
    }
    return "";
  }

  return (
    <div className="tree-page">
      <div className="d-flex align-items-left px-0">
        <span
          className="d-inline-block"
          onClick={(e) => setShowChildren(!showChildren)}
        >
          {prefix}
        </span>{" "}
        <span
          className={"d-inline-block " + (isActivePage ? "text-bold" : "")}
          onClick={(e) => props.gotoPage(props.data.slug)}
        >
          {props.data.title} {lock}
        </span>
      </div>
      {children()}
    </div>
  );
}

export default PageLink;
