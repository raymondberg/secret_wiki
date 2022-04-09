import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { SecretButton } from "../buttons/SecretButton";

class PageCreateModal extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handlePageCreate = this.handlePageCreate.bind(this);
    this.state = { title: null, slug: null, isAdminOnly: false };
  }

  handlePageCreate() {
    var body = {
      title: this.state.title,
      is_admin_only: this.state.isAdminOnly,
    };

    if (this.state.slug !== null) {
      body.slug = this.state.slug;
    }

    this.props.api
      .post(`w/${this.props.wikiSlug}/p`, body)
      .then((response) => response.json())
      .then((page) => {
        this.setState({ title: null, slug: null });
        this.props.handlePageCreate(page.slug);
      });
  }

  handleChange(event) {
    if (event.target.name === "page_title") {
      this.setState({ title: event.target.value });
    } else if (event.target.name === "page_slug") {
      this.setState({ slug: event.target.value });
    } else if (event.target.name === "isSecret") {
      this.setState({ isAdminOnly: !this.state.isAdminOnly });
      event.target.blur();
    }
  }

  render() {
    return (
      <Modal
        show={this.props.shouldShow}
        onHide={this.props.handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Page</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-9 py-3">
              <div className="row">
                <div className="col-md-3 py-3">
                  <b>Page Title:</b>
                </div>
                <div className="col-md-9 py-3">
                  <input
                    type="text"
                    name="page_title"
                    onChange={this.handleChange}
                    value={this.state.title ? this.state.title : ""}
                  />
                </div>
                <div className="col-md-3">
                  <em>Slug: (optional)</em>
                </div>
                <div className="col-md-9">
                  <input
                    type="text"
                    name="page_slug"
                    onChange={this.handleChange}
                    value={this.state.slug ? this.state.slug : ""}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-3 py-3">
              <ButtonGroup vertical size="lg">
                <Button variant="primary" onClick={this.handlePageCreate}>
                  Create
                </Button>
                <Button variant="secondary" onClick={this.props.handleClose}>
                  Close
                </Button>
                <SecretButton
                  isSecret={this.state.isAdminOnly}
                  onChange={this.handleChange}
                />
              </ButtonGroup>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    );
  }
}

export default PageCreateModal;
