import { useSelector } from "react-redux";
import ButtonGroup from "react-bootstrap/ButtonGroup";

const BUTTONS_PER_ROW = 4;
const chunked = (a) =>
  Array.from(new Array(Math.ceil(a.length / BUTTONS_PER_ROW)), (_, i) =>
    a.slice(i * BUTTONS_PER_ROW, i * BUTTONS_PER_ROW + BUTTONS_PER_ROW)
  );

export function PermissionForm(props) {
  const users = useSelector((state) => state.users.value);
  if (users.length === 0) {
    return <div />;
  } else {
    // TODO Revisit when read-only added
    const usersWithPermission = (props.permissions || []).map((e) => e.user);
    const userSlices = chunked(users);

    return (
      <div>
        {userSlices.map((usersInSlice) => (
          <ButtonGroup key={usersInSlice[0].id} size="sm">
            {usersInSlice.map((u) => (
              <PermissionCheckBox
                key={u.email}
                username={u.email}
                userId={u.id}
                hasPermission={usersWithPermission.includes(u.id)}
                changePermission={props.changePermission}
              />
            ))}
          </ButtonGroup>
        ))}
      </div>
    );
  }
}

function PermissionCheckBox(props) {
  const classSpecifier = props.hasPermission
    ? "btn btn-warning"
    : "btn btn-light";
  return (
    <button
      className={classSpecifier}
      onClick={function (e) {
        e.target.blur();
        props.changePermission(props.userId, !props.hasPermission);
      }}
    >
      {props.username}
    </button>
  );
}

export default PermissionForm;
