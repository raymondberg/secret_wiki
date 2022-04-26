import { getLock } from "../Icons";

export function fromObject(pageLinkObject, gotoPage) {
  return (
    <PageLink
      key={pageLinkObject.id}
      data={pageLinkObject}
      gotoPage={gotoPage}
    />
  );
}

export function PageLink(props) {
  const lock = props.data.is_secret ? getLock() : "";
  return (
    <div className="tree-page font-bold">
      {props.prefix}{" "}
      <span onClick={(e) => props.gotoPage(props.data.slug)}>
        {props.data.title} {lock}
      </span>
      {props.data.children.map((l) => fromObject(l, props.gotoPage))}
    </div>
  );
}

export default PageLink;
