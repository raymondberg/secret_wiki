import { getLock } from "../Icons";

export function PageTitle(props) {
  const lock = props.page.is_admin_only ? getLock() : "";
  return (
    <h2 className="page-title">
      {props.page.title} <span style={{ fontSize: ".75em" }}>{lock}</span>
    </h2>
  );
}

export default PageTitle;
