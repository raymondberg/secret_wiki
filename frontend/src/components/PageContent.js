import React from "react";
import Section from "./Section";

class PageContent extends React.Component {
  constructor(props) {
      super(props);

      this.state = {error: null, sections: []};
  }

  componentDidMount() {
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
      { this.state.sections.map((section) =>
        <Section key={section.id} wikiId={this.props.wikiId} pageId={this.props.pageId} section={section} />
      ) }
      </div>
    )
  }
}

export default PageContent;
