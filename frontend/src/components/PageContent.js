import React from "react";
import { SectionEdit, SectionShow, Gutter } from "./Section";

const SECTION_SPACER = 10

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
      this.convertGutter = this.convertGutter.bind(this)
      this.destroySection = this.destroySection.bind(this)
      this.gutterAt = this.gutterAt.bind(this)
      this.reloadPageHandler = this.reloadPageHandler.bind(this)
      this.toggleEdit = this.toggleEdit.bind(this)
      this.updateSection = this.updateSection.bind(this)
  }

  toggleEdit(sectionId) {
    if (sectionId === null) {
      console.log("Cannot convert without sectionId")
      return
    } else {
      console.log(`Toggling ${sectionId}`)
    }

    this.setState(
      { sections: this.state.sections.map(
        function(s) {
          if (s.id === sectionId) {
            console.log(`toggling ${s.id}`, (!s.editMode)?"on":"off")
            s.edit_mode = !s.edit_mode
          }
          return s
        }
      )}
    )
  }

  destroySection(sectionIndex) {
    console.log("wiping the sections to exclude", sectionIndex)
    this.setState({sections: this.state.sections.filter((s) => s.id != null || s.section_index !== sectionIndex)})
  }

  convertGutter(sectionIndex) {
    //Warning, permuting state in a dumb way then storing it. Could improve.
    console.log(`Converting cutter at ${sectionIndex}`)
    var newSection = {
      section_index: sectionIndex,
      edit_mode: true,
      exists_on_server: false,
    }
    for(var i=0; i < this.state.sections.length; i++) {
      var convertedGutter = false
      if ( this.state.sections[i].section_index >= sectionIndex ) {
        console.log("Converting gutter at sectionIndex ", sectionIndex)
        this.state.sections.splice(i, 0, newSection)
        convertedGutter = true
        break
      }
    }
    if (!convertedGutter) {
      console.log("Pushing gutter at end", newSection)
      this.state.sections.push(newSection)
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
    if (this.props.wikiId !== prevProps.wikiId || this.props.pageId !== prevProps.pageId) {
      this.updatePageFromServer()
    }
  }

  updatePageFromServer() {
    if (this.props.wikiId === null || this.props.pageId === null) return

    fetch(`http://localhost:8000/api/w/${this.props.wikiId}/p/${this.props.pageId}/s`, { crossDomain: true })
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

  updateSection(sectionId, content, section_index, isAdminOnly) {
     const requestOptions = {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
            id: sectionId,
            content: content,
            section_index: section_index,
            is_admin_only: isAdminOnly,
            wiki_id: this.props.wikiId,
            page_id: this.props.pageId,
         })
     };
     var url = `http://localhost:8000/api/w/${this.props.wikiId}/p/${this.props.pageId}/s`
     var isCreate = true
     if (sectionId) {
        url += `/${sectionId}`
        isCreate = false
     }
     fetch(url, requestOptions)
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

  minGutterIndex() {
    console.log(this.state.sections)
    var all_indexes = this.state.sections.map((s) => s.section_index)
    return Math.min(Math.min.apply(Math, all_indexes), 5000) - SECTION_SPACER
  }

  gutterAt(sectionId, sectionIndex) {
     return <Gutter key={`gutter-after-${sectionId}-${sectionIndex}`} sectionIndex={sectionIndex} editCallback={this.convertGutter}/>
  }

  render() {
    var elements = [this.gutterAt(null, this.minGutterIndex())]
    this.state.sections.forEach((section) => {
        if (section.edit_mode) {
          elements.push(<SectionEdit key={section.id}
                                     section={section}
                                     toggleEdit={this.toggleEdit}
                                     destroySection={this.destroySection}
                                     updateSectionCallback={this.updateSection}/>)
        } else {
          elements.push( <SectionShow key={section.id} section={section} toggleEdit={this.toggleEdit}/>)
        }
        elements.push( this.gutterAt(section.id, section.section_index + SECTION_SPACER) )
      }
    )

    return (
      <div id="content">
        {elements}
      </div>
    )
  }
}

export default PageContent;
