import React from "react";
import Toggle from "react-toggle";

export default function EditModeToggle(props) {
  return (
    <div id="status" className="p-2">
      <label>
        <Toggle
          checked={props.editMode}
          disabled={props.isDisabled}
          icons={{
            checked: <div className="pencil">✏️</div>,
            unchecked: null,
          }}
          onChange={(e) => props.setEditMode(e.target.checked)}
        />
      </label>
    </div>
  );
}
