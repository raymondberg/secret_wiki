import React from "react";
import NewPageModal from "./NewPageModal";
import PageContent from "./PageContent";
import PageTree from "./PageTree";
import WikiList from "./WikiList";

class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = { wikiId: null, pageId: null }

    this.handleWikiChange = this.handleWikiChange.bind(this)
    this.handlePageChange = this.handlePageChange.bind(this)
  }

  handleWikiChange(newWikiId) {
    console.log("Loading new wiki " + newWikiId)
    this.setState({ wikiId: newWikiId })
  }

  handlePageChange(newPageId) {
    console.log("Loading new page " + newPageId)
    this.setState({ pageId: newPageId })
  }

  render() {
    return (
      <div id="main-container" className="container">
        <div className="row">
          <div className="d-flex justify-content-between header-section p-0">
            <div className="p-2">
              <h3>Secret Wiki</h3>
            </div>
            <WikiList handleWikiChange={this.handleWikiChange} />
            <div id="status" className="p-2"></div>
          </div>
        </div>
        <div className="row">
          <div id="left-bar" className="col-md-3">
            <div id="add-new">
              <PageTree wikiId={this.state.wikiId} pageId={this.state.pageId} handlePageChange={this.handlePageChange}/>
              <button onClick={() => NewPageModal} className="page-gutter btn btn-primary">
              </button>
            </div>
          </div>
          <div className="col-md-9">
            <PageContent wikiId={this.state.wikiId} pageId={this.state.pageId}/>
          </div>
        </div>
      </div>
    )
  }
}

export default Main;
