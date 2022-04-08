import React from "react";

import SectionList from "./SectionList";
import SectionSquash from "./SectionSquash";

function sectionFromAPI(apiSection) {
  return Object.assign(
    {exists_on_server: true, edit_mode: false, prior_content: apiSection.content},
    apiSection,
  )
}

class PageContent extends React.Component {
  constructor(props) {
      super(props);

      this.state = {error: null, sections: []};
      this.destroySection = this.destroySection.bind(this)
      this.insertSectionAt = this.insertSectionAt.bind(this)
      this.reloadPageHandler = this.reloadPageHandler.bind(this)
      this.toggleEdit = this.toggleEdit.bind(this)
      this.updateSection = this.updateSection.bind(this)
  }

  toggleEdit(sectionId) {
    if (sectionId === null) {
      console.log("Cannot convert without sectionId")
      return
    }

    this.setState(
      { sections: this.state.sections.map(
        function(s) {
          if (s.id === sectionId) {
            s.edit_mode = !s.edit_mode
          }
          return s
        }
      )}
    )
  }

  destroySection(sectionIndex, section) {
    console.log("wiping the sections to exclude", sectionIndex)
    if (section !== undefined && section.id) {
      this.props.api.delete(`w/${this.props.wikiSlug}/p/${this.props.page.slug}/s/${section.id}`)
        .then( (result) => {
          if (result.status === 204) {
            this.updatePageFromServer()
          }
        })
    }
    this.setState({sections: this.state.sections.filter((s) => s.id != null || s.section_index !== sectionIndex)})
  }

  insertSectionAt(sectionIndex, newSection) {
    //Warning, permuting state in a dumb way then storing it. Could improve.
    if (sectionIndex === -1) {
      this.state.sections.push(newSection)
    } else {
      this.state.sections.splice(sectionIndex, 0, newSection)
    }
    this.setState({sections: this.state.sections})
  }

  componentDidMount() {
    this.updatePageFromServer()
  }

  reloadPageHandler() {
    this.updatePageFromServer()
  }

  componentDidUpdate(prevProps) {
    if (this.props.page === undefined || this.props.page.slug === undefined) return

    if (this.props.wikiSlug !== prevProps.wikiSlug || prevProps.page === undefined || this.props.page.slug !== prevProps.page.slug) {
      this.updatePageFromServer()
    }
  }

  updatePageFromServer() {
    if (this.props.wikiSlug === null || this.props.page === undefined || this.props.page === null) return

    this.props.api.get(`w/${this.props.wikiSlug}/p/${this.props.page.slug}/s`)
      .then((res) => res.json())
      .then(
        (returnedSections) => {
            if (Array.isArray(returnedSections)) {
              this.setState({sections: returnedSections.map(sectionFromAPI), error: null})
            } else {
              this.setState({sections: [], error: "Invalid response"})
            }
        },
        (e) => {
          this.setState({sections: [], error: e});
        }
      );
  }

  updateSection(sectionId, content, section_index, isAdminOnly, permissions) {
     var body = {
        content: content,
        section_index: section_index,
        is_admin_only: isAdminOnly,
        permissions: permissions,
     };
     var url = `w/${this.props.wikiSlug}/p/${this.props.page.slug}/s`
     var isCreate = true
     if (sectionId) {
        url += `/${sectionId}`
        isCreate = false
     }
     this.props.api.post(url, body)
        .then(response => response.json())
        .then(section => {
          if (isCreate) {
            // Introducing a bad behavior as a shortcut: if this is called the entire page will reload.
            // The consequence is that some edits will allow other edits to still be made, but adding a section
            // will reset the entire page and destroy any active edits.
            this.reloadPageHandler()
          } else {
            this.setState({sections: this.state.sections.map((s) => (s.id === sectionId)?sectionFromAPI(section):s) })
          }
          this.setState({editMode: false})
        });
  }

  render() {
    const title = (this.props.page === undefined) ? null : <h2 className="page-title">{this.props.page.title}</h2>
    var content = (this.props.editMode)? (
      <SectionList
         sections={this.state.sections}
         insertSectionAt={this.insertSectionAt}
         updateSection={this.updateSection}
         destroySection={this.destroySection}
         toggleEdit={this.toggleEdit}/>
    ):(
      <SectionSquash sections={this.state.sections} />
    )
    return (
      <div id="content">
        { title }
        { content }
      </div>
    )
  }
}

export default PageContent;
