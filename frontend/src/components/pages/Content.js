import { useState } from "react";
import { SectionCollection } from "../sections/Collection";
import PageTree from "./Tree";

export function PageContent(props) {
  const [pages, setPages] = useState([]);

  function pageForSlug(pageSlug) {
    return pages.filter((p) => p.slug === pageSlug)[0];
  }

  return (
    <div className="row">
      <div id="left-bar" className="col-md-3">
        <div id="add-new">
          <PageTree
            wikiSlug={props.wikiSlug}
            pageSlug={props.pageSlug}
            pages={pages}
            setPages={setPages}
            gotoPage={props.gotoPage}
            api={props.api}
          />
          <button
            onClick={() => props.setPageCreateModalShow(true)}
            className="page-gutter btn btn-primary"
          />
        </div>
      </div>
      <div className="col-md-9">
        <SectionCollection
          wikiSlug={props.wikiSlug}
          page={pageForSlug(props.pageSlug)}
          api={props.api}
          editMode={props.editMode}
        />
      </div>
    </div>
  );
}

export default PageContent;
