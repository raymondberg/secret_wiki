import React from "react";

class WikiList extends React.Component {
  constructor(props) {
    super(props);
    this.handleWikiChange = this.handleWikiChange.bind(this)
    this.state = {error: false, wikis: []}
  }

  handleWikiChange(wikiSlug) {
    this.props.handleWikiChange(wikiSlug)
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
          <WikiLink key={wiki.id} wikiSlug={wiki.slug} selected={this.props.wikiSlug === wiki.slug} handleWikiChange={this.handleWikiChange}/>
        ) }
        </div>
      );
    }
  }
}


function WikiLink(props) {
  return (
    <span className={"header-wiki " + (props.selected ? "header-wiki-selected":"")}
          onClick={(e) => { props.handleWikiChange(props.wikiSlug) }}>
      {props.wikiSlug}
    </span>
  )
}

export default WikiList;
