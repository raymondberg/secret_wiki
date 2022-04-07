import React from "react";
import DOMPurify from 'dompurify';
import marked from "marked";
import { PermissionForm } from "./PermissionForm";
import ButtonGroup from 'react-bootstrap/ButtonGroup'


export function Gutter(props) {
   return (
      <div className="page-section-gutter" sectionindex={props.sectionIndex}
           onDoubleClick={(e) => props.editCallback(props.sectionIndex)}/>
    )
}

export function SectionShow(props) {
    function markdownContent(thing) {
      if (props.section.prior_content) {
        return { __html: marked(DOMPurify.sanitize(props.section.prior_content)) };
      }
    }

    var section_class = (
      "page-section-wrapper row " +
      (props.section.is_secret ? " page-section-restricted" : "page-section-public")
    );
    return (
      <div className={section_class}
        onDoubleClick={(e) => props.toggleEdit(props.section.id)}>
          <div className="page-section col-xs-12"
          dangerouslySetInnerHTML={markdownContent()}/>
      </div>
    )
}

export class SectionEdit extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      content: props.section.content,
      is_secret: props.section.is_secret,
      permissions: props.section.permissions,
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleChangePermission = this.handleChangePermission.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.saveContentToServer = this.saveContentToServer.bind(this);
  }

  handleChange(event) {
    if (event.target.name === 'content') {
      this.setState({content: event.target.value})
    } else if ( event.target.name === 'isSecret') {
      this.setState({is_secret: !this.state.is_secret})
      event.target.blur()
    }
  }

  handleChangePermission(userId, shouldHaveAccess) {
      const permission = this.state.permissions.find(e => e.id === userId)
      if(permission === undefined) {
        this.setState({permissions: this.state.permissions.concat([{ id: userId, level: "edit" }])})
      } else {
        this.setState({permissions: this.state.permissions.filter(e => e !== permission)})
      }
  }


  handleDelete(event) {
    if (this.props.section.exists_on_server) {
      if (!window.confirm("Do you really want to delete this section?")) {
        return
      }
    }
    this.props.destroySection(this.props.section.section_index, this.props.section)
  }

  saveContentToServer() {
    this.props.updateSectionCallback(this.props.section.id, this.state.content, this.props.section.section_index, this.state.is_secret)
  }


  render() {
    var cancelCallback = (this.props.section.exists_on_server)?(
      (e) => this.props.toggleEdit(this.props.section.id)
    ):(
      (e) => this.props.destroySection(this.props.section.section_index)
    )

    var rows = 2
    if (this.state.content) {
      rows = Math.max((this.state.content.match(/\n/g) || []).length, rows)
    }

    return (
      <div className="page-section-wrapper row data-entry">
        <div className="col-md-10">
          <div>
            <textarea autoFocus name="content" className="page-section"
                      rows={rows}
                      onChange={this.handleChange} value={this.state.content}/>
          </div>
          <div>
            <PermissionForm permissions={this.state.permissions} changePermission={this.handleChangePermission}/>
          </div>
        </div>
        <div className="col-md-2">
          <div>
            <ButtonGroup vertical>
              <button className="btn btn-primary section-button" onClick={this.saveContentToServer}>Save</button>
              <button className="btn btn-light section-button" onClick={cancelCallback}>Cancel</button>

              <ButtonGroup size='lg'>
                <SecretButton isSecret={this.state.is_secret} onChange={this.handleChange}/>
                <button className="btn btn-light section-button" onClick={this.handleDelete}>&#128465;</button>
              </ButtonGroup>
            </ButtonGroup>
          </div>
        </div>
      </div>
    )
  }
}

export function SecretButton(props) {
  var classSpecifier = "btn section-button btn-light"
  var icon = <React.Fragment>&#128275;</React.Fragment>

  if (props.isSecret) {
    classSpecifier += "btn section-button btn-warning"
    icon = <React.Fragment>&#128274;</React.Fragment>
  }

  return (
    <button name="isSecret" className={classSpecifier} onClick={props.onChange}>{icon}</button>
  )
}
