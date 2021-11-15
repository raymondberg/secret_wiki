import marked from "marked";

export default function SectionSquash (props) {
  var convertedSections = props.sections.map((s)=>s.prior_content).join("\n\n")
  return (
    <div class="section-squash">
      <div dangerouslySetInnerHTML={{ __html: marked(convertedSections, {sanitize: true}) }} />
    </div>
  )
}
