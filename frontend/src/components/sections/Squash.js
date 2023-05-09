import { marked } from "marked";
import DOMPurify from "dompurify";
import { linkReplace } from "../../common.js";

function clean(text) {
  return marked(DOMPurify.sanitize(linkReplace(text)));
}

function renderSection(section, secretMode) {
  if (section.is_secret && !secretMode) {
    return "";
  }
  const clean_content = clean(section.prior_content);
  return section.is_secret
    ? `<div class="secret-text">${clean_content}\n</div>`
    : clean_content;
}

export default function SectionSquash(props) {
  const convertedSections = props.sections.map((s) =>
    renderSection(s, props.secretMode)
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
