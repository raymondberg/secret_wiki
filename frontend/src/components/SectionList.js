import React from "react";
import { SectionEdit, SectionShow, Gutter } from "./Section";

const SECTION_SPACER = 10

export default class SectionList extends React.Component {
  constructor(props) {
      super(props);

      this.convertGutter = this.convertGutter.bind(this)
      this.gutterAt = this.gutterAt.bind(this)
  }

  convertGutter(sectionIndex) {
    //Warning, permuting state in a dumb way then storing it. Could improve.
    console.log(`Converting gutter at ${sectionIndex}`)
    var newSection = {
      section_index: sectionIndex,
      edit_mode: true,
      exists_on_server: false,
    }
    for(var i=0; i < this.props.sections.length; i++) {
      var convertedGutter = false
      if ( this.props.sections[i].section_index >= sectionIndex ) {
        console.log("Converting gutter at sectionIndex ", sectionIndex)
        this.props.insertSectionAt(i, newSection)
        convertedGutter = true
        break
      }
    }
    if (!convertedGutter) {
      console.log("Pushing gutter at end", newSection)
      this.props.insertSectionAt(-1, newSection)
    }
  }

  minGutterIndex() {
    var all_indexes = this.props.sections.map((s) => s.section_index)
    return Math.min(Math.min.apply(Math, all_indexes), 5000) - SECTION_SPACER
  }

  gutterAt(sectionId, sectionIndex) {
     return <Gutter key={`gutter-after-${sectionId}-${sectionIndex}`} sectionIndex={sectionIndex} editCallback={this.convertGutter}/>
  }

  render() {
    var elements = [this.gutterAt(null, this.minGutterIndex())]
    this.props.sections.forEach((section) => {
        if (section.edit_mode) {
          elements.push(<SectionEdit key={section.section_index}
                                     section={section}
                                     toggleEdit={this.props.toggleEdit}
                                     destroySection={this.props.destroySection}
                                     updateSectionCallback={this.props.updateSection}/>)
        } else {
          elements.push( <SectionShow key={section.id} section={section} toggleEdit={this.props.toggleEdit}/>)
        }
        elements.push( this.gutterAt(section.id, section.section_index + SECTION_SPACER) )
      }
    )

    return (
      <div id="sections">
        { elements }
      </div>
    )
  }
}
