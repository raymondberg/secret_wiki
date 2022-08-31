import React from "react";
import logout_icon from "../../images/logout.png";

export default function LogoutButton(props) {
  return (
    <div id="status">
      <button className="btn btn-light" onClick={props.logout}>
        <img src={logout_icon} className="logout gg-icon" alt="Logout" />
      </button>
    </div>
  );
}
