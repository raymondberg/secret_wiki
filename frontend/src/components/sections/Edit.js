import { React, useState } from "react";
import { PermissionForm } from "./Permissions";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { SecretButton } from "../buttons/SecretButton";
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";
import { useSelector } from "react-redux";

export default function SectionEdit(props) {
  const [content, setContent] = useState(props.section.content);
  const [isSecret, setIsSecret] = useState(props.section.is_admin_only);
  const [permissions, setPermissions] = useState(
    props.section.permissions || []
  );

  const pages = useSelector((state) => state.wiki.pages);

  function autoCompletionsMatching(fragment) {
    return pages.filter((p) =>
      p.slug.toLowerCase().startsWith(fragment.toLowerCase())
    );
  }

  function cancelCallback(e) {
    props.toggleEdit(props.section.id);
  }

  function handleChange(event) {
    if (event.target.name === "content") {
      setContent(event.target.value);
    } else if (event.target.name === "isSecret") {
      setIsSecret(!isSecret);
      event.target.blur();
    }
  }

  function handleChangePermission(userId, shouldHaveAccess) {
    const permission = permissions.find((e) => e.user === userId);
    if (permission === undefined) {
      setPermissions(permissions.concat([{ user: userId, level: "edit" }]));
    } else {
      setPermissions(permissions.filter((e) => e !== permission));
    }
  }

  function clearAndClose(event) {
    setContent("");
    event.target.blur();
    cancelCallback();
  }

  function handleDelete(event) {
    if (props.section.exists_on_server) {
      if (!window.confirm("Do you really want to delete this section?")) {
        return;
      }
    }
    props.destroySection(props.section);
  }

  function saveContentToServer() {
    props.updateSection(
      props.section.id,
      content,
      props.section.section_index,
      isSecret,
      permissions,
      props.section.exists_on_server
    );
  }

  var rows = 2;
  if (content) {
    rows = Math.max((content.match(/\n/g) || []).length, rows) + 1;
  }

  const Item = ({ entity: { slug, title } }) => (
    <div>{`${slug}: ${title}`}</div>
  );

  return (
    <div
      data-sectionindex={props.section.section_index}
      className="page-section-wrapper row data-entry"
    >
      <div className="col-md-10">
        <div>
          <ReactTextareaAutocomplete
            autoFocus
            name="content"
            className="page-section"
            rows={rows}
            onChange={handleChange}
            loadingComponent={() => <span>Loading</span>}
            value={content}
            trigger={{
              "(p:": {
                dataProvider: (token) => {
                  const tokenSubset = token.replace(/p.*:/, "");
                  return autoCompletionsMatching(tokenSubset);
                },
                component: Item,
                output: (item, trigger) => `(page:${item.slug})`,
              },
              "[": {
                dataProvider: (token) => {
                  return autoCompletionsMatching(token);
                },
                component: Item,
                output: (item, trigger) => `[${item.title}](page:${item.slug})`,
              },
            }}
          />
        </div>
        <div>
          {isSecret ? (
            <PermissionForm
              permissions={permissions}
              changePermission={handleChangePermission}
            />
          ) : (
            <span />
          )}
        </div>
      </div>
      <div className="col-md-2">
        <div>
          <ButtonGroup vertical>
            <button
              className="btn btn-primary section-button"
              onClick={saveContentToServer}
            >
              Save
            </button>
            <button
              className="btn btn-light section-button"
              onClick={cancelCallback}
            >
              Cancel
            </button>

            <ButtonGroup size="lg">
              <SecretButton isSecret={isSecret} onChange={handleChange} />
              <button
                className="btn btn-light section-button"
                onClick={
                  props.section.exists_on_server ? handleDelete : clearAndClose
                }
              >
                &#128465;
              </button>
            </ButtonGroup>
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
}
