import marked from "marked";
import DOMPurify from "dompurify";

export default function SectionSquash (props) {
  var convertedSections = props.sections.map((s)=>s.prior_content).join("\n\n")
  return (
    <div className="section-squash">
      <div dangerouslySetInnerHTML={{ __html: marked(DOMPurify.sanitize(convertedSections)) }} />
    </div>
  )
}
