import { getLock } from "../Icons";

function PageLink(props) {
  const lock = props.page.is_admin_only ? getLock() : "";
  return (
    <div
      className="tree-page font-bold"
      onClick={(e) => props.gotoPage(props.page.slug)}
    >
      {props.page.title} {lock}
    </div>
  );
}

export default PageLink;
