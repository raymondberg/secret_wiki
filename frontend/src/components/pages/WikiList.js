import { React } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateWiki } from "../../shared/wikiSlice";

export function WikiList(props) {
  const wikis = useSelector((state) => state.wiki.wikis);
  const activeWiki = useSelector((state) => state.wiki.wiki);

  const dispatch = useDispatch();

  if (wikis.length === 0) {
    return <div id="wiki-list" />;
  } else {
    return (
      <div id="wiki-list" className="p-2">
        {wikis.map((wiki) => (
          <WikiLink
            key={wiki.id}
            wiki={wiki}
            selected={activeWiki !== null && activeWiki?.id === wiki.id}
            handleWikiChange={(w) => dispatch(updateWiki(w))}
          />
        ))}
      </div>
    );
  }
}

function WikiLink(props) {
  return (
    <span
      className={
        "header-wiki " + (props.selected ? "header-wiki-selected" : "")
      }
      onClick={(e) => {
        props.handleWikiChange(props.wiki);
      }}
    >
      {props.wiki.slug}
    </span>
  );
}

export default WikiList;
