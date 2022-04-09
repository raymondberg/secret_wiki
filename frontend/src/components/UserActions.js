import EditModeToggle from "./buttons/EditModeToggle";
import LogoutButton from "./buttons/LogoutButton";

export default function UserActions(props) {
  return (
    <div id="status" className="p-2">
      <div className="row">
        <div className="d-md-flex header-section p-0 px-3">
          <EditModeToggle
            editMode={props.editMode}
            setEditMode={props.setEditMode}
          />
          <LogoutButton logout={props.api.logout} />
        </div>
      </div>
    </div>
  );
}
