import EditModeToggle from "./buttons/EditModeToggle";
import SecretModeToggle from "./buttons/SecretModeToggle";
import LogoutButton from "./buttons/LogoutButton";

export default function UserActions(props) {
  return (
    <div id="status" className="p-2">
      <div className="row">
        <div className="d-md-flex header-section p-0 px-3">
          <SecretModeToggle
            secretMode={props.secretMode}
            setSecretMode={props.setSecretMode}
          />
          <EditModeToggle
            editMode={props.editMode}
            isDisabled={!props.secretMode}
            setEditMode={props.setEditMode}
          />
          <LogoutButton logout={props.api.logout} />
        </div>
      </div>
    </div>
  );
}
