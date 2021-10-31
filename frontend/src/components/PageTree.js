import React from "react";

class PageTree extends React.Component {
  constructor(props) {
      super(props);

      this.state = {wikiId: props.wikiId, pages: []};
  }

  componentDidMount() {
    this.updateTree()
  }

  componentDidUpdate(prevProps) {
    if (this.props.wikiId !== prevProps.wikiId) {
      this.updateTree()
    }
  }

  updateTree() {
    if (this.props.wikiId === null ) return

    fetch(`http://localhost:8000/api/w/${this.props.wikiId}/p`, { crossDomain: true })
      .then((res) => res.json())
      .then(
        (returnedPages) => {
          console.log(returnedPages)
            if (Array.isArray(returnedPages)) {
              this.setState({pages: returnedPages});
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
      <div id="wiki-list" className="p-2">
      { this.state.pages.map(
        (page) => <PageLink key={page.id} title={page.title} pageId={page.id} handlePageChange={this.props.handlePageChange}/>
         ) }
      </div>
    )
  }
}

class PageLink extends React.Component {
  render() {
    return <div className="tree-page" onClick={(e) => this.props.handlePageChange(this.props.pageId)}>{this.props.title}</div>
  }
}

export default PageTree;
