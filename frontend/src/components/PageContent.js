import React from "react";
import marked from "marked";

class PageContent extends React.Component {
  constructor(props) {
      super(props);

      this.state = {error: null, sections: []};
  }

  componentDidMount() {
    this.updatePage()
  }

  componentDidUpdate(prevProps) {
    if (this.props.wikiId !== prevProps.wikiId || this.props.pageId !== prevProps.pageId) {
      this.updatePage()
    }
  }

  updatePage() {
    console.log("could" + this.props.wikiId + this.props.pageId)
    if (this.props.wikiId === null || this.props.pageId === null) return
    console.log("did")

    fetch(`http://localhost:8000/api/w/${this.props.wikiId}/p/${this.props.pageId}/s`, { crossDomain: true })
      .then((res) => res.json())
      .then(
        (returnedSections) => {
          console.log(returnedSections)
            if (Array.isArray(returnedSections)) {
              this.setState({sections: returnedSections});
            } else {
              this.setState({error: "Invalid response"})
            }
        },
        (e) => {
          this.setState({error: e});
        }
      );
  }

  render() {
    return (
      <div id="content">
        { this.state.sections.map((section) => <Section key={section.id} section={section} />) }
      </div>
    )
  }
}

class Section extends React.Component {
  markdownContent(thing) {
    return { __html: marked(this.props.section.content, {sanitize: true}) };
  }

  render() {
    return (
      <div className="page-section-wrapper row">
        <div class="page-section-wrapper row">
          <div class="page-section col-xs-12" dangerouslySetInnerHTML={this.markdownContent()}/>
        </div>
      </div>
    )
  }
}

export default PageContent;
