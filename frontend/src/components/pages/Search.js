import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { pickPageBySlug } from "../../shared/wikiSlice";
import ReactSearchBox from "react-search-box";

export default function Search(props) {
  const [data, setData] = useState([]);
  const activeWiki = useSelector((state) => state.wiki.wiki);
  const dispatch = useDispatch();
  const placeholder = "Search...";

  const handleKeyPress = useCallback((event) => {
    if (event.ctrlKey === true && event.key === "t") {
      const result = document.querySelector(
        `input[placeholder="${placeholder}"]`
      );
      result.focus();
    }
  }, []);

  useEffect(() => {
    //          attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

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
        placeholder={placeholder}
        value="Doe"
        data={data}
        onChange={retrieveData}
        clearOnSelect={true}
        // match everything
        fuseConfigs={{ threshold: 1.0 }}
        onSelect={(record) => dispatch(pickPageBySlug(record.item.key))}
      />
    </div>
  );
}
