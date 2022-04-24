import React from "react";
import { Gutter } from "./Gutter";
import SectionEdit from "./Edit";
import SectionShow from "./Show";

function SectionRender(props) {
  if (props.section.edit_mode) {
    return (
      <SectionEdit
        key={props.section.section_index}
        section={props.section}
        toggleEdit={props.toggleEdit}
        destroySection={props.destroySection}
        updateSection={props.updateSection}
      />
    );
  } else if (props.section.is_gutter) {
    return (
      <Gutter
        key={`gutter-${props.section.id}`}
        section={props.section}
        toggleEdit={props.toggleEdit}
        isOnlySection={props.isOnlySection}
      />
    );
  } else {
    return (
      <SectionShow
        key={props.section.id}
        section={props.section}
        toggleEdit={props.toggleEdit}
      />
    );
  }
}

export function SectionList(props) {
  const isOnlySection = props.sections.length === 1;
  return (
    <div id="sections">
      {props.sections.map((section) => (
        <SectionRender
          key={section.id}
          section={section}
          toggleEdit={props.toggleEdit}
          destroySection={props.destroySection}
          updateSection={props.updateSection}
          isOnlySection={isOnlySection}
        />
      ))}
    </div>
  );
}

export default SectionList;
