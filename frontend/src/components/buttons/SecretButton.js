import React from "react";

export function SecretButton(props) {
  var classSpecifier = "btn section-button btn-light"
  var icon = <React.Fragment>&#128275;</React.Fragment>

  if (props.isSecret) {
    classSpecifier += "btn section-button btn-warning"
    icon = <React.Fragment>&#128274;</React.Fragment>
  }

  return (
    <button name="isSecret" className={classSpecifier} onClick={props.onChange}>{icon}</button>
  )
}

export default SecretButton
