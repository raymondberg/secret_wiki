import { useSelector } from "react-redux";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

export default function PageLinkDropdown(props) {
  const pages = useSelector((state) => state.wiki.pages);
  const defaultParentPage = useSelector((state) => state.wiki.page);

  let baseOptions = [{ value: null, label: "None" }];
  let defaultOption = "None";

  if (props.isCreate) {
    baseOptions.push({
      value: defaultParentPage.id,
      label: defaultParentPage.title,
    });
    if (defaultParentPage) {
      defaultOption = defaultParentPage.title;
    }
  }

  const options = baseOptions.concat(
    pages
      .filter((p) => p.id !== defaultParentPage?.id)
      .map((p) => ({ value: p.id, label: p.title }))
  );

  return (
    <Dropdown
      options={options}
      onChange={props.onChange}
      value={props.value}
      placeholder={defaultOption}
    />
  );
}
