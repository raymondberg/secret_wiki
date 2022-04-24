import DOMPurify from "dompurify";
import marked from "marked";
import { linkReplace } from "../../common.js";

export function markdownContent(text) {
  return {
    __html: marked(DOMPurify.sanitize(text)),
  };
}

export default function SectionShow(props) {
  const section_class =
    "page-section-wrapper row clickable " +
    (props.section.is_secret
      ? " page-section-restricted"
      : "page-section-public");

  const content = markdownContent(linkReplace(props.section.prior_content));

  return (
    <div
      data-sectionindex={props.section.section_index}
      className={section_class}
      onDoubleClick={(e) => props.toggleEdit(props.section.id)}
    >
      <div
        className="page-section col-xs-12"
        dangerouslySetInnerHTML={content}
      />
    </div>
  );
}
