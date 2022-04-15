import marked from "marked";
import DOMPurify from "dompurify";
import { linkReplace } from "../../common.js";

export default function SectionSquash(props) {
  const convertedSections = props.sections
    .map((s) => s.prior_content)
    .join("\n\n");
  return (
    <div className="section-squash">
      <div
        dangerouslySetInnerHTML={{
          __html: marked(DOMPurify.sanitize(linkReplace(convertedSections))),
        }}
      />
    </div>
  );
}
