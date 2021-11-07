import React from "react";
import marked from "marked";

class Section extends React.Component {
  constructor(props) {
    super(props)

    this.state = Object.assign({}, {editMode: false}, this.stateFromSection(props.section))

    this.toggleEdit = this.toggleEdit.bind(this)
    this.toggleEdit = this.toggleEdit.bind(this)
    this.handleChange = this.handleChange.bind(this);
    this.saveContentToServer = this.saveContentToServer.bind(this)
  }

  stateFromSection(section) {
    if (section == null) {
      return {}
    }
    return {
      sectionId: section.id,
      content: section.content,
      isAdminOnly: section.is_admin_only,
      priorContent: section.content,
      priorIsAdminOnly: section.is_admin_only,
    }
  }

  handleChange(event) {
    if (event.target.name === 'content') {
      this.setState({content: event.target.value})
    } else if ( event.target.name === 'isAdminOnly') {
      this.setState({isAdminOnly: event.target.checked})
    }
  }

  saveContentToServer() {
     const requestOptions = {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
            id: this.state.sectionId,
            content: this.state.content,
            wiki_id: this.props.wikiId,
            page_id: this.props.pageId,
            is_admin_only: this.state.isAdminOnly,
         })
     };
     var url = `http://localhost:8000/api/w/${this.props.wikiId}/p/${this.props.pageId}/s`
     var isCreate = true
     if (this.state.sectionId) {
        url += `/${this.state.sectionId}`
        isCreate = false
     }
     fetch(url, requestOptions)
        .then(response => response.json())
        .then(section => {
          if (isCreate) {
            // Introducing a bad behavior as a shortcut: if this is called the entire page will reload.
            // The consequence is that some edits will allow other edits to still be made, but adding a section
            // will reset the entire page and destroy any active edits.
            this.props.reloadPageHandler()
          } else {
            this.setState(Object.assign({}, { editMode: false }, this.stateFromSection(section)))
          }
        });
  }

  toggleEdit() {
    if (this.state.editMode)  {
      this.setState({editMode: false, isAdminOnly: this.state.priorIsAdminOnly})
    } else {
      this.setState({editMode: true})
    }
  }

  markdownContent(thing) {
    if (this.state.content) {
      return { __html: marked(this.state.priorContent, {sanitize: true}) };
    }
  }

  render() {
    if (this.props.isGutter && ! this.state.editMode)  {
      return (
        <div className="page-section-gutter"
             onDoubleClick={this.toggleEdit}/>
      )
    } else if (this.state.editMode) {
      return (
        <div className="page-section-wrapper row data-entry">
          <div className="col-md-10">
            <textarea name="content" className="page-section"
                      onChange={this.handleChange} value={this.state.content}/>
          </div>
          <div className="col-md-2">
            <div>
              Admin Only:
              <input name="isAdminOnly" type="checkbox"
                     defaultChecked={this.state.isAdminOnly} onChange={this.handleChange}/>
            </div>
              <button className="btn btn-primary section-button" onClick={this.saveContentToServer}>Save</button>
              <button className="btn btn-light section-button" onClick={this.toggleEdit}>Cancel</button>
          </div>
        </div>
      )
    } else {
      return (
        <div className="page-section-wrapper row"
          onDoubleClick={this.toggleEdit}>
          <div className="page-section-wrapper row">
            <div className="page-section col-xs-12"
            dangerouslySetInnerHTML={this.markdownContent()}/>
          </div>
        </div>
      )
    }
  }
}

export default Section
