import { React, useState, useEffect } from "react";

import SectionList from "./List";
import SectionSquash from "./Squash";
import { useSelector } from "react-redux";
import { anyUndefined } from "../../common.js";

function sectionFromAPI(apiSection) {
  return Object.assign(apiSection, {
    exists_on_server: true,
    edit_mode: false,
    is_gutter: false,
    prior_content: apiSection.content,
  });
}

function gutterDefinition(sectionIndex) {
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
}

export function SectionCollection(props) {
  const [error, setError] = useState(null);
  const [sections, setSections] = useState([]);
  const activePage = useSelector((state) => state.wiki.page);
  const activeWiki = useSelector((state) => state.wiki.wiki);
  console.log(error);

  function toggleEdit(sectionId) {
    setSections(
      sections.map(function (s) {
        if (s.id === sectionId) {
          s.edit_mode = !s.edit_mode;
        }
        return s;
      })
    );
  }

  function destroySection(section) {
    if (section !== undefined && section.exists_on_server) {
      props.api
        .delete(`w/${activeWiki.slug}/p/${activePage.slug}/s/${section.id}`)
        .then((result) => {
          setSections(
            Array.from(
              stripDuplicateGutters(sections.filter((s) => s.id !== section.id))
            )
          );
        });
    }
  }

  useEffect(
    function () {
      if (anyUndefined(activeWiki?.slug, activePage.slug)) return;

      const controller = new AbortController();
      props.api
        .get(`w/${activeWiki.slug}/p/${activePage.slug}/s`, controller.signal)
        .then((res) => res.json())
        .then(
          (returnedSections) => {
            if (Array.isArray(returnedSections)) {
              setSections(Array.from(interleaveGutters(returnedSections)));
              setError(null);
            } else {
              setError("Invalid response");
            }
          },
          (e) => {
            setError(e);
          }
        );
      return () => {
        // Cleanup that would be called if (1) effect reruns or (2) collection
        // component unmounts.
        controller.abort();
      };
    },

    [activeWiki?.slug, activePage?.slug, props.api]
  );

  function updateSection(
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
    var url = `w/${activeWiki.slug}/p/${activePage.slug}/s`;
    if (existsOnServer) {
      url += `/${sectionId}`;
    }

    props.api
      .post(url, body)
      .then((response) => response.json())
      .then((section) => {
        var newSections = sections
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
        setSections(newSections);
        // editMode: false,
      });
  }

  if (props.editMode) {
    return (
      <div id="content">
        <SectionList
          sections={sections}
          updateSection={updateSection}
          destroySection={destroySection}
          toggleEdit={toggleEdit}
        />
      </div>
    );
  } else {
    return (
      <div id="content">
        <SectionSquash sections={sections.filter((s) => !s.is_gutter)} />
      </div>
    );
  }
}

export default SectionCollection;
