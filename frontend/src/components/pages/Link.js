import React from "react";

class PageLink extends React.Component {
  render() {
    return (
      <div
        className="tree-page"
        onClick={(e) => this.props.gotoPage(this.props.pageSlug)}
      >
        {this.props.title}
      </div>
    );
  }
}

export default PageLink;
