import React from "react";

import SectionList from "./List";
import SectionSquash from "./Squash";

function sectionFromAPI(apiSection) {
  return Object.assign(apiSection, {
    exists_on_server: true,
    edit_mode: false,
    is_gutter: false,
    prior_content: apiSection.content,
  });
}

function gutterDefinition(sectionIndex) {
  console.log(sectionIndex);
  return {
    exists_on_server: false,
    edit_mode: false,
    is_gutter: true,
    prior_content: "",
    section_index: sectionIndex,
    id: crypto.randomUUID(),
  };
}

const SECTION_SPACER = 10;

function minGutterIndex(sections) {
  var all_indexes = sections.map((s) => s.section_index);
  return Math.min(Math.min.apply(Math, all_indexes), 5000) - SECTION_SPACER;
}

function* stripDuplicateGutters(sections) {
  var lastSection = null;
  for (const section of sections) {
    if (lastSection === null || !lastSection.is_gutter || !section.is_gutter) {
      yield section;
    }
    lastSection = section;
  }
}

function* interleaveGutters(sections) {
  // Generator to decorate sections with gutters
  yield gutterDefinition(minGutterIndex(sections) - 1);
  for (const s of sections) {
    yield sectionFromAPI(s);
    yield gutterDefinition(s.section_index + 1);
  }
  console.log("done updated");
}

export class SectionCollection extends React.Component {
  constructor(props) {
    super(props);

    this.state = { error: null, sections: [] };
    this.destroySection = this.destroySection.bind(this);
    this.insertSectionAt = this.insertSectionAt.bind(this);
    this.reloadPageHandler = this.reloadPageHandler.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.updateSection = this.updateSection.bind(this);
  }

  toggleEdit(sectionId) {
    this.setState({
      sections: this.state.sections.map(function (s) {
        if (s.id === sectionId) {
          s.edit_mode = !s.edit_mode;
        }
        return s;
      }),
    });
  }

  destroySection(section) {
    if (section !== undefined && section.exists_on_server) {
      this.props.api
        .delete(
          `w/${this.props.wikiSlug}/p/${this.props.page.slug}/s/${section.id}`
        )
        .then((result) => {
          this.setState({
            sections: Array.from(
              stripDuplicateGutters(
                this.state.sections.filter((s) => s.id !== section.id)
              )
            ),
          });
        });
    }
  }

  insertSectionAt(sectionIndex, newSection) {
    //Warning, permuting state in a dumb way then storing it. Could improve.
    if (sectionIndex === -1) {
      this.state.sections.push(newSection);
    } else {
      this.state.sections.splice(sectionIndex, 0, newSection);
    }
    this.setState({ sections: this.state.sections });
  }

  componentDidMount() {
    this.updateCollectionFromServer();
  }

  reloadPageHandler() {
    this.updateCollectionFromServer();
  }

  componentDidUpdate(prevProps) {
    if (this.props.page === undefined || this.props.page.slug === undefined)
      return;

    if (
      this.props.wikiSlug !== prevProps.wikiSlug ||
      prevProps.page === undefined ||
      this.props.page.slug !== prevProps.page.slug
    ) {
      this.updateCollectionFromServer();
    }
  }

  updateCollectionFromServer() {
    // Wipes out all local changes and refreshes state from the server
    if (
      this.props.wikiSlug === null ||
      this.props.page === undefined ||
      this.props.page === null
    )
      return;

    this.props.api
      .get(`w/${this.props.wikiSlug}/p/${this.props.page.slug}/s`)
      .then((res) => res.json())
      .then(
        (returnedSections) => {
          if (Array.isArray(returnedSections)) {
            this.setState({
              sections: Array.from(interleaveGutters(returnedSections)),
              error: null,
            });
          } else {
            this.setState({ sections: [], error: "Invalid response" });
          }
        },
        (e) => {
          this.setState({ sections: [], error: e });
        }
      );
  }

  updateSection(
    sectionId,
    content,
    sectionIndex,
    isSecret,
    permissions,
    existsOnServer
  ) {
    var body = {
      content: content,
      section_index: sectionIndex,
      is_admin_only: isSecret,
      permissions: permissions,
    };
    var url = `w/${this.props.wikiSlug}/p/${this.props.page.slug}/s`;
    if (existsOnServer) {
      url += `/${sectionId}`;
    }

    this.props.api
      .post(url, body)
      .then((response) => response.json())
      .then((section) => {
        var newSections = this.state.sections
          .map((s) =>
            s.id === sectionId
              ? [
                  gutterDefinition(section.section_index - 1),
                  sectionFromAPI(section),
                  gutterDefinition(section.section_index + 1),
                ]
              : s
          )
          .flat();
        this.setState({
          sections: newSections,
          editMode: false,
        });
      });
  }

  render() {
    const title =
      this.props.page === undefined ? null : (
        <h2 className="page-title">{this.props.page.title}</h2>
      );
    var content = this.props.editMode ? (
      <SectionList
        sections={this.state.sections}
        updateSection={this.updateSection}
        destroySection={this.destroySection}
        toggleEdit={this.toggleEdit}
      />
    ) : (
      <SectionSquash
        sections={this.state.sections.filter((s) => !s.is_gutter)}
      />
    );
    return (
      <div id="content">
        {title}
        {content}
      </div>
    );
  }
}

export default SectionCollection;
