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
    this.props.api.get("w")
      .then((res) => res.json())
      .then(
        (returnedWikis) => {
            if (Array.isArray(returnedWikis)) {
              this.setState({wikis: returnedWikis, error: null});
            } else {
              this.setState({wikis: [], error: "Invalid response"})
            }
        },
        (e) => {
          this.setState({wikis: [], error: e});
        }
      );
  }

  render() {
    if (this.state.error) {
      return <div>Error: {this.state.error.message}</div>;
    } else {
      return (
        <div id="wiki-list" className="p-2">
        { this.state.wikis.map((wiki) =>
          <WikiLink key={wiki.id} wikiId={wiki.id} selected={this.props.wikiId === wiki.id} handleWikiChange={this.handleWikiChange}/>
        ) }
        </div>
      );
    }
  }
}


function WikiLink(props) {
  return (
    <span className={"header-wiki " + (props.selected ? "header-wiki-selected":"")}
          key={props.wikiId} onClick={(e) => { props.handleWikiChange(props.wikiId) }}>
      {props.wikiId}
    </span>
  )
}

export default WikiList;
