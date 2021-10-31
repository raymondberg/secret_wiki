import React from "react";

class WikiList extends React.Component {
  constructor(props) {
    super(props);
    this.handleWikiChange = this.handleWikiChange.bind(this)
    this.state = {error: false, wikis: []}
  }

  handleWikiChange(wikiId) {
    console.log("Clicked wiki " + wikiId)
    this.props.handleWikiChange(wikiId)
  }

  componentDidMount() {
    fetch("http://localhost:8000/api/w", { crossDomain: true })
      .then((res) => res.json())
      .then(
        (returnedWikis) => {
            if (Array.isArray(returnedWikis)) {
              this.setState({wikis: returnedWikis});
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
    if (this.state.error) {
      return <div>Error: {this.state.error.message}</div>;
    } else {
      return (
        <div id="wiki-list" className="p-2">
        { this.state.wikis.map((wiki) => <WikiLink key={wiki.id} wikiId={wiki.id} handleWikiChange={this.handleWikiChange}/>) }
        </div>
      );
    }
  }
}


class WikiLink extends React.Component {
  render() {
      const wikiUpdater = this.props.handleWikiChange
      return (
        <span className="header-wiki" key={this.props.wikiId} onClick={(e) => { wikiUpdater(this.props.wikiId) }}>
          {this.props.wikiId}
        </span>
      )
  }
}

export default WikiList;
