import { SectionCollection } from "../sections/Collection";
import PageTree from "./Tree";
import PageTitle from "./Title";

export function PageContent(props) {
  return (
    <div className="row">
      <div id="left-bar" className="col-md-3">
        <div id="add-new">
          <PageTree api={props.api} />
          <button
            onClick={() => props.setPageCreateModalShow(true)}
            className="page-gutter btn btn-primary"
          />
        </div>
      </div>
      <div className="col-md-9">
        <div id="content">
          {props.page !== undefined && props.page !== null ? (
            <div>
              <PageTitle page={props.page} api={props.api} />
              <SectionCollection api={props.api} editMode={props.editMode} />
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}

export default PageContent;
