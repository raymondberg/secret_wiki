import React from "react";
import Section from "./Section";

class PageContent extends React.Component {
  constructor(props) {
      super(props);

      this.state = {error: null, sections: []};
      this.reloadPageHandler = this.reloadPageHandler.bind(this)
  }

  componentDidMount() {
    this.updatePageFromServer()
  }

  reloadPageHandler() {
    console.log("reloading page")
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
              this.setState({sections: returnedSections, error: null});
            } else {
              this.setState({sections: [], error: "Invalid response"})
            }
        },
        (e) => {
          this.setState({sections: [], error: e});
        }
      );
  }

  gutterFor(id) {
    return (
      <Section key={`gutter-${id}`}
               wikiId={this.props.wikiId}
               pageId={this.props.pageId}
               isGutter={true}
               reloadPageHandler={this.reloadPageHandler}/>
    );

  }

  addGutters(sections) {
    for (var i = 0; i < sections.length; i+=2) {
      sections.splice(i, 0, this.gutterFor(i))
    }

    if (sections.length > 0 && sections[sections.length - 1].type.name === 'Section') {
      sections.push(this.gutterFor(sections.length))
    }
  }

  render() {
    var sections =  this.state.sections.map((section) =>
        <Section key={section.id} wikiId={this.props.wikiId} pageId={this.props.pageId} section={section} />
    )

    this.addGutters(sections)

    return (
      <div id="content">
        {sections}
      </div>
    )
  }
}

export default PageContent;
