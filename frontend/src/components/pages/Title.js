import { useState } from "react";
import Form from "react-bootstrap/Form";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { getLock, EditIcon } from "../Icons";
import { SecretButton } from "../buttons/SecretButton";

export function PageTitle(props) {
  const [editMode, setEditMode] = useState(false);

  function toggleEditMode() {
    setEditMode(!editMode);
  }

  const editIcon = props.page.is_admin_only ? getLock() : <EditIcon />;

  if (editMode) {
    return (
      <div>
        {props.page.title}
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
      <h2 className="page-title">
        {props.page.title}
        <span style={{ fontSize: ".75em" }} onClick={toggleEditMode}>
          {editIcon}
        </span>
      </h2>
    );
  }
}

function TitleEditForm(props) {
  const [isSecret, setIsSecret] = useState(props.page.is_secret);
  const [title, setTitle] = useState(props.page.title);

  function save() {
    if (
      window.confirm(
        "Are you sure you want to change? You'll lose all unsaved section edits"
      )
    ) {
      props.toggleEditMode();
      props.api
        .post(`w/${props.wikiSlug}/p/${props.page.slug}`)
        .then((res) => res.json())
        .then(function (data) {
          props.gotoPage(props.wikiSlug, data.slug);
        });
    }
  }

  return (
    <div className="page-edit-form">
      <div className="row">
        <div className="col-md-5">
          <Form.Control
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="col-md-5">
          <ButtonGroup>
            <SecretButton
              isSecret={props.isSecret}
              onChange={(e) => {
                e.target.blur();
                props.setIsSecret(!props.isSecret);
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
