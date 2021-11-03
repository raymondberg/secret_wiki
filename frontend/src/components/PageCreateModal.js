import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

class PageCreateModal extends React.Component {
  constructor(props){
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handlePageCreate = this.handlePageCreate.bind(this)
    this.state = {title: null, slug: null, isAdminOnly: false}
  }

  handlePageCreate() {
     const requestOptions = {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
            wiki_id: this.props.wikiId,
            id: this.state.slug,
            title: this.state.title,
            is_admin_only: this.state.isAdminOnly,
         })
     };
     fetch(`http://localhost:8000/api/w/${this.props.wikiId}/p`, requestOptions)
        .then(response => response.json())
        .then(page => {
          this.setState({title: null, slug: null})
          this.props.handlePageCreate(page.id)
        });
  }

  handleChange(event) {
    if (event.target.name === 'page_title') {
      this.setState({title: event.target.value})
    } else if ( event.target.name === 'page_slug') {
      this.setState({slug: event.target.value})
    } else if ( event.target.name === 'is_admin_only') {
      this.setState({isAdminOnly: event.target.checked})
    }
  }

  render() {
    return (
      <Modal show={this.props.shouldShow} onHide={this.props.handleClose}
          backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Create Page</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>Page Title: <input type="text" name="page_title" onChange={this.handleChange} value={this.state.title ? this.state.title : ""}/></div>
          <div>Page Slug: <input type="text" name="page_slug" onChange={this.handleChange} value={this.state.slug ? this.state.slug: ""} /></div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.handleClose}>Close</Button>
          <Button variant="primary" onClick={this.handlePageCreate}>Create</Button>
          Admin Only? <input name="is_admin_only" type="checkbox"
                   defaultChecked={this.state.isAdminOnly} onChange={this.handleChange}/>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default PageCreateModal;
