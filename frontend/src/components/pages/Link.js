import { useState } from "react";
import { getLock } from "../Icons";

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

  const isActivePage = props.activePageId === props.data.id;

  console.log(props.activePageId, props.data.id);
  return (
    <div className={"tree-page " + (isActivePage ? "text-bold" : "")}>
      <div className="d-flex align-items-left px-0">
        <span
          className="d-inline-block"
          onClick={(e) => setShowChildren(!showChildren)}
        >
          {prefix}
        </span>{" "}
        <span
          className="d-inline-block"
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
