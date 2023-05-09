import React from "react";
import Toggle from "react-toggle";

export default function SecretModeToggle(props) {
  return (
    <div id="status" className="p-2">
      <label>
        <Toggle
          defaultChecked={props.secretMode}
          icons={{
            checked: <div className="eyeball">👁</div>,
            unchecked: null,
          }}
          onChange={(e) => props.setSecretMode(e.target.checked)}
        />
      </label>
    </div>
  );
}
