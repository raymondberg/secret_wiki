import { React, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateWikis, updateWiki } from "../../shared/wikiSlice";

export function WikiList(props) {
  const [error, setError] = useState(null);
  const wikis = useSelector((state) => state.wiki.wikis);
  const activeWiki = useSelector((state) => state.wiki.wiki);

  const dispatch = useDispatch();

  useEffect(() => {
    if (wikis.length === 0 && error === null) {
      props.api
        .get("w")
        .then((res) => res.json())
        .then(
          (returnedWikis) => {
            if (Array.isArray(returnedWikis)) {
              dispatch(updateWikis(returnedWikis));
              setError(null);
            } else {
              setError("Invalid response");
            }
          },
          (e) => {
            if (e) {
              setError("error in extract " + e);
            }
          }
        );
    }
  });

  if (error) {
    return <div>Error: {error}</div>;
  } else if (wikis === undefined) {
    return <div>Loading wikis..</div>;
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
