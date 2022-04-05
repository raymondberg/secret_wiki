import React from "react";
import marked from "marked";
import { PermissionForm } from "./PermissionForm";

export function Gutter(props) {
   return (
      <div className="page-section-gutter" sectionindex={props.sectionIndex}
           onDoubleClick={(e) => props.editCallback(props.sectionIndex)}/>
    )
}

export function SectionShow(props) {
    function markdownContent(thing) {
      if (props.section.prior_content) {
        return { __html: marked(props.section.prior_content, {sanitize: true}) };
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

    this.state = {content: props.section.content, is_secret: props.section.is_secret, permissions: props.section.permissions}

    this.handleChange = this.handleChange.bind(this);
    this.saveContentToServer = this.saveContentToServer.bind(this);
  }

  handleChange(event) {
    if (event.target.name === 'content') {
      this.setState({content: event.target.value})
    } else if ( event.target.name === 'isAdminOnly') {
      this.setState({is_secret: event.target.checked})
    }
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
    console.log("this should be it: " + this.state.permissions)

    return (
      <div className="page-section-wrapper row data-entry">
        <div className="col-md-10">
          <textarea name="content" className="page-section"
                    rows={rows}
                    onChange={this.handleChange} value={this.state.content}/>
        </div>
        <div className="col-md-2">
          <div>
            Admin Only:
            <input name="isAdminOnly" type="checkbox"
                   defaultChecked={this.state.is_secret} onChange={this.handleChange}/>
          </div>
            <button className="btn btn-primary section-button" onClick={this.saveContentToServer}>Save</button>
            <button className="btn btn-light section-button" onClick={cancelCallback}>Cancel</button>
        </div>
        <PermissionForm permissions={this.state.permissions}/>
      </div>
    )
  }
}
