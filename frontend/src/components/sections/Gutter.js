export function Gutter(props) {
  return (
    <div
      data-sectionindex={props.section.section_index}
      className={`page-section-gutter ${
        props.isOnlySection ? "always-visible" : ""
      }`}
      onDoubleClick={(e) => props.toggleEdit(props.section.id)}
    />
  );
}

export default Gutter;
