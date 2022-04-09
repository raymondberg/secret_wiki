import DOMPurify from 'dompurify';
import marked from "marked";

export function SectionShow(props) {
    function markdownContent(thing) {
      if (props.section.prior_content) {
        return { __html: marked(DOMPurify.sanitize(props.section.prior_content)) };
      }
    }

    var section_class = (
      "page-section-wrapper row " +
      (props.section.is_secret ? " page-section-restricted" : "page-section-public")
    );
    return (
      <div className={section_class}
        onDoubleClick={(e) => props.toggleEdit(props.section.id)}>
          <div className="page-section col-xs-12"
          dangerouslySetInnerHTML={markdownContent()}/>
      </div>
    )
}

export default SectionShow
