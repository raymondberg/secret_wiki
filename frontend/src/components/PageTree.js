import React from "react";

class PageTree extends React.Component {
  constructor(props) {
      super(props);

      this.state = {wikiId: props.wikiId};
  }

  componentDidMount() {
    this.updateTree()
  }

  componentDidUpdate(prevProps) {
    if (this.props.wikiId !== prevProps.wikiId || this.props.pageId !== prevProps.pageId) {
      this.updateTree()
    }
  }

  updateTree() {
    if (this.props.wikiId === null ) return

    this.props.api.get(`w/${this.props.wikiId}/p`)
      .then((res) => res.json())
      .then(
        (returnedPages) => {
            if (Array.isArray(returnedPages)) {
              this.props.setPages(returnedPages)
              this.setState({error: null});
            } else {
              this.props.setPages([])
              this.setState({error: "Invalid response"})
            }
        },
        (e) => {
          this.props.setPages([])
          this.setState({error: e})
        }
      );
  }

  render() {
    return (
      <div id="wiki-list" className="p-2">
      { this.props.pages.map(
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
