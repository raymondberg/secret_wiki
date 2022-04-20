import { React, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { SecretButton } from "../buttons/SecretButton";
import { useSelector, useDispatch } from "react-redux";
import { addPage, updatePageBySlug } from "../../shared/wikiSlice";

export default function PageCreateModal(props) {
  const [title, setTitle] = useState(null);
  const [slug, setSlug] = useState(null);
  const [isSecret, setIsSecret] = useState(false);
  const activeWiki = useSelector((state) => state.wiki.wiki);
  const dispatch = useDispatch();

  function handlePageCreate() {
    const body = {
      title: title,
      is_secret: isSecret,
    };

    if (slug !== null) {
      body.slug = slug;
    }

    props.api
      .post(`w/${activeWiki.slug}/p`, body)
      .then((response) => response.json())
      .then(function (page) {
        setTitle(null);
        setSlug(null);
        dispatch(addPage(page));
        dispatch(updatePageBySlug(slug));
        props.handleClose();
      });
  }

  function handleChange(event) {
    if (event.target.name === "page_title") {
      setTitle(event.target.value);
    } else if (event.target.name === "page_slug") {
      setSlug(event.target.value);
    } else if (event.target.name === "isSecret") {
      setIsSecret(!isSecret);
      event.target.blur();
    }
  }

  return (
    <Modal
      show={props.shouldShow}
      onHide={props.handleClose}
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
                  onChange={handleChange}
                  value={title ? title : ""}
                />
              </div>
              <div className="col-md-3">
                <em>Slug: (optional)</em>
              </div>
              <div className="col-md-9">
                <input
                  type="text"
                  name="page_slug"
                  onChange={handleChange}
                  value={slug ? slug : ""}
                />
              </div>
            </div>
          </div>
          <div className="col-md-3 py-3">
            <ButtonGroup vertical size="lg">
              <Button variant="primary" onClick={handlePageCreate}>
                Create
              </Button>
              <Button variant="secondary" onClick={props.handleClose}>
                Close
              </Button>
              <SecretButton isSecret={isSecret} onChange={handleChange} />
            </ButtonGroup>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer></Modal.Footer>
    </Modal>
  );
}
