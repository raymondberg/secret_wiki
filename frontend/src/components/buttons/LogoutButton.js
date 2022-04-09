import React from "react";

export default function LogoutButton(props) {
  return (
    <div id="status">
      <button className="btn btn-light" onClick={props.logout}>
        &#127916;
      </button>
    </div>
  );
}
