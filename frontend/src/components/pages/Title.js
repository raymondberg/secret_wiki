import { useState } from "react";
import Form from "react-bootstrap/Form";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { useDispatch, useSelector } from "react-redux";
import { getLock } from "../Icons";
import { SecretButton } from "../buttons/SecretButton";
import PageLinkDropdown from "../dropdowns/PageLink";
import { invalidatePagesCache, updatePageBySlug } from "../../shared/wikiSlice";

export function PageTitle(props) {
  const [editMode, setEditMode] = useState(false);

  function toggleEditMode() {
    setEditMode(!editMode);
  }

  const permissionIcon = props.page.is_secret ? getLock() : <span />;

  if (editMode) {
    return (
      <div>
        <TitleEditForm
          key={`${props.page.title}-title`}
          page={props.page}
          api={props.api}
          editMode={editMode}
          toggleEditMode={toggleEditMode}
        />
      </div>
    );
  } else {
    return (
      <h1
        className={`page-title ${props.wikiInEditMode ? "clickable" : ""}`}
        onDoubleClick={function () {
          if (props.wikiInEditMode) {
            toggleEditMode();
          }
        }}
      >
        {props.page.title}
        <span style={{ fontSize: ".75em" }}>{permissionIcon}</span>
      </h1>
    );
  }
}

function TitleEditForm(props) {
  const [isSecret, setIsSecret] = useState(props.page.is_secret);
  const [parentPageId, setParentPageId] = useState(props.page.parent_page_id);
  const [title, setTitle] = useState(props.page.title);
  const [slug, setSlug] = useState(props.page.slug);
  const activeWiki = useSelector((state) => state.wiki.wiki);
  const dispatch = useDispatch();

  function save() {
    if (
      window.confirm(
        "Are you sure you want to change? You'll lose all unsaved section edits"
      )
    ) {
      const body = {
        title,
        slug,
        is_secret: isSecret,
        parent_page_id: parentPageId,
      };
      props.toggleEditMode();
      props.api
        .post(`w/${activeWiki.slug}/p/${props.page.slug}`, body)
        .then((res) => res.json())
        .then(function (data) {
          dispatch(invalidatePagesCache());
          dispatch(updatePageBySlug(null));
        });
    }
  }

  return (
    <div className="page-edit-form">
      <div className="row">
        <div className="col-md-5">
          Title:
          <Form.Control
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          Slug:
          <Form.Control
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          Parent:
          <PageLinkDropdown
            value={parentPageId}
            onChange={(e) => setParentPageId(e.value)}
          />
        </div>
        <div className="col-md-5">
          <ButtonGroup>
            <SecretButton
              isSecret={isSecret}
              onChange={(e) => {
                e.target.blur();
                setIsSecret(!isSecret);
              }}
            />
            <button className="btn btn-primary section-button" onClick={save}>
              Save
            </button>
            <button
              className="btn btn-light section-button"
              onClick={props.toggleEditMode}
            >
              Cancel
            </button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
}
export default PageTitle;
