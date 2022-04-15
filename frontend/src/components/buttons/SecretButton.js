import { getLock } from "../Icons";

export function SecretButton(props) {
  let classSpecifier = "btn section-button btn-light";
  if (props.isSecret) {
    classSpecifier += "btn section-button btn-warning";
  }

  return (
    <button name="isSecret" className={classSpecifier} onClick={props.onChange}>
      {getLock(props.isSecret)}
    </button>
  );
}

export default SecretButton;
