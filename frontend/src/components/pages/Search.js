import { useState } from "react";
import Form from "react-bootstrap/Form";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { useDispatch, useSelector } from "react-redux";
import { getLock, EditIcon } from "../Icons";
import { SecretButton } from "../buttons/SecretButton";
import { invalidatePagesCache, updatePageBySlug } from "../../shared/wikiSlice";
import ReactSearchBox from "react-search-box";

export default function Search(props) {
  const [data, setData] = useState([]);
  const activeWiki = useSelector((state) => state.wiki.wiki);
  const dispatch = useDispatch();

  function retrieveData(term) {
    if (term.length > 1) {
      const controller = new AbortController();
      props.api
        .get(`w/${activeWiki.slug}/search?q=${term}`, controller.signal)
        .then((res) => res.json())
        .then(
          (matchingTerms) => {
            if (Array.isArray(matchingTerms)) {
              setData(
                matchingTerms.map(function (term) {
                  return {
                    key: term.page_slug,
                    value: `${term.page_slug} -- ${term.excerpt}`,
                  };
                })
              );
            }
          },
          (e) => {}
        );
      return () => {
        controller.abort();
      };
    } else {
      console.log("clearing results");
      setData([]);
    }
  }

  return (
    <div id="wiki-list" className="p-2">
      <ReactSearchBox
        placeholder="Search..."
        value="Doe"
        data={data}
        onChange={retrieveData}
        clearOnSelect={true}
        // match everything
        fuseConfigs={{ threshold: 1.0 }}
        onSelect={(record) => dispatch(updatePageBySlug(record.item.key))}
      />
    </div>
  );
}
