import { useSelector } from "react-redux";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

export default function PageLinkDropdown(props) {
  const pages = useSelector((state) => state.wiki.pages);

  const options = [{ value: null, label: "None" }].concat(
    pages.map((p) => ({ value: p.id, label: p.title }))
  );

  return (
    <Dropdown
      options={options}
      onChange={props.onChange}
      value={props.value}
      placeholder="None"
    />
  );
}
