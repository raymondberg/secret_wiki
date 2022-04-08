import { useSelector } from 'react-redux'
import ButtonGroup from 'react-bootstrap/ButtonGroup'

export function PermissionForm(props) {
  const users = useSelector((state) => state.users.value)
  // TODO Revisit when read-only added
  const usersWithPermission = (props.permissions || []).map(e => e.user)
  return (
    <ButtonGroup size="lg">
      {users.map((u) => <PermissionCheckBox key={u.email}
                                            username={u.email}
                                            userId={u.id}
                                            hasPermission={usersWithPermission.includes(u.id)}
                                            changePermission={props.changePermission}
                                            />)}
    </ButtonGroup>
  )
}

function PermissionCheckBox(props) {
  const classSpecifier = props.hasPermission ? "btn btn-warning": "btn btn-light"
    return (
        <button className={classSpecifier} onClick={function(e) { e.target.blur(); props.changePermission(props.userId, !props.hasPermission)}}>
           { props.username }
         </button>
    )
}

export default PermissionForm;
