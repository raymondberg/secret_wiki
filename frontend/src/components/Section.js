import React from "react";
import marked from "marked";

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

    return (
      <div className="page-section-wrapper row"
        onDoubleClick={(e) => props.toggleEdit(props.section.id)}>
        <div className="page-section-wrapper row">
          <div className="page-section col-xs-12"
          dangerouslySetInnerHTML={markdownContent()}/>
        </div>
      </div>
    )
}

export class SectionEdit extends React.Component {
  constructor(props) {
    super(props)

    this.state = {content: props.section.content, is_admin_only: props.section.is_admin_only}

    this.handleChange = this.handleChange.bind(this);
    this.saveContentToServer = this.saveContentToServer.bind(this);
  }

  handleChange(event) {
    if (event.target.name === 'content') {
      this.setState({content: event.target.value})
    } else if ( event.target.name === 'isAdminOnly') {
      this.setState({is_admin_only: event.target.checked})
    }
  }

  saveContentToServer() {
    this.props.updateSectionCallback(this.props.section.id, this.state.content, this.props.section.section_index, this.state.is_admin_only)
  }

  render() {
    var cancelCallback = (this.props.section.exists_on_server)?(
      (e) => this.props.toggleEdit(this.props.section.id)
    ):(
      (e) => this.props.destroySection(this.props.section.section_index)
    )

    return (
      <div className="page-section-wrapper row data-entry">
        <div className="col-md-10">
          <textarea name="content" className="page-section"
                    rows={Math.max((this.state.content.match(/\n/g) || []).length, 2)}
                    onChange={this.handleChange} value={this.state.content}/>
        </div>
        <div className="col-md-2">
          <div>
            Admin Only:
            <input name="isAdminOnly" type="checkbox"
                   defaultChecked={this.state.is_admin_only} onChange={this.handleChange}/>
          </div>
            <button className="btn btn-primary section-button" onClick={this.saveContentToServer}>Save</button>
            <button className="btn btn-light section-button" onClick={cancelCallback}>Cancel</button>
        </div>
      </div>
    )
  }
}
