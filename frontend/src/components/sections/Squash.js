import marked from "marked";
import DOMPurify from "dompurify";
import { linkReplace } from "../../common.js";

function clean(text) {
  return marked(DOMPurify.sanitize(linkReplace(text)));
}
export default function SectionSquash(props) {
  const convertedSections = props.sections.map((s) =>
    s.is_secret
      ? `<div class="secret-text">${clean(s.prior_content)}\n</div>`
      : clean(s.prior_content)
  );
  return (
    <div className="section-squash">
      <div
        dangerouslySetInnerHTML={{
          __html: convertedSections.join("\n\n"),
        }}
      />
    </div>
  );
}
