import DOMPurify from "dompurify";
import marked from "marked";

function markdownContent(text) {
  return {
    __html: marked(DOMPurify.sanitize(text)),
  };
}

export function SectionShow(props) {
  var section_class =
    "page-section-wrapper row " +
    (props.section.is_secret
      ? " page-section-restricted"
      : "page-section-public");
  return (
    <div
      data-sectionindex={props.section.section_index}
      className={section_class}
      onDoubleClick={(e) => props.toggleEdit(props.section.id)}
    >
      <div
        className="page-section col-xs-12"
        dangerouslySetInnerHTML={markdownContent(props.section.prior_content)}
      />
    </div>
  );
}

export default SectionShow;
