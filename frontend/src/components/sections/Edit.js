import React from "react";
import { PermissionForm } from "./Permissions";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { SecretButton } from "../buttons/SecretButton";

export class SectionEdit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      content: props.section.content,
      is_secret: props.section.is_secret,
      permissions: props.section.permissions || [],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleChangePermission = this.handleChangePermission.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.clearAndClose = this.clearAndClose.bind(this);
    this.saveContentToServer = this.saveContentToServer.bind(this);
    this.cancelCallback = (e) => this.props.toggleEdit(this.props.section.id);
  }

  handleChange(event) {
    if (event.target.name === "content") {
      this.setState({ content: event.target.value });
    } else if (event.target.name === "isSecret") {
      this.setState({ is_secret: !this.state.is_secret });
      event.target.blur();
    }
  }

  handleChangePermission(userId, shouldHaveAccess) {
    const permission = this.state.permissions.find((e) => e.user === userId);
    if (permission === undefined) {
      this.setState({
        permissions: this.state.permissions.concat([
          { user: userId, level: "edit" },
        ]),
      });
    } else {
      this.setState({
        permissions: this.state.permissions.filter((e) => e !== permission),
      });
    }
  }

  clearAndClose(event) {
    this.setState({ content: "" });
    event.target.blur();
    this.cancelCallback();
  }

  handleDelete(event) {
    if (this.props.section.exists_on_server) {
      if (!window.confirm("Do you really want to delete this section?")) {
        return;
      }
    }
    this.props.destroySection(this.props.section);
  }

  saveContentToServer() {
    this.props.updateSection(
      this.props.section.id,
      this.state.content,
      this.props.section.section_index,
      this.state.is_secret,
      this.state.permissions,
      this.props.section.exists_on_server
    );
  }

  render() {
    var rows = 2;
    if (this.state.content) {
      rows = Math.max((this.state.content.match(/\n/g) || []).length, rows) + 1;
    }

    return (
      <div
        data-sectionIndex={this.props.section.section_index}
        className="page-section-wrapper row data-entry"
      >
        <div className="col-md-10">
          <div>
            <textarea
              autoFocus
              name="content"
              className="page-section"
              rows={rows}
              onChange={this.handleChange}
              value={this.state.content}
            />
          </div>
          <div>
            {this.state.is_secret ? (
              <PermissionForm
                permissions={this.state.permissions}
                changePermission={this.handleChangePermission}
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
                onClick={this.saveContentToServer}
              >
                Save
              </button>
              <button
                className="btn btn-light section-button"
                onClick={this.cancelCallback}
              >
                Cancel
              </button>

              <ButtonGroup size="lg">
                <SecretButton
                  isSecret={this.state.is_secret}
                  onChange={this.handleChange}
                />
                <button
                  className="btn btn-light section-button"
                  onClick={
                    this.props.section.exists_on_server
                      ? this.handleDelete
                      : this.clearAndClose
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
}

export default SectionEdit;
