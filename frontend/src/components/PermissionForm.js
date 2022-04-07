import { useSelector } from 'react-redux'

export function PermissionForm(props) {
  const users = useSelector((state) => state.users.value)

  return (
    <div className="row">
      {users.map((u) => <PermissionCheckBox key={u.email} username={u.email}/>)}
    </div>
  )
}

function PermissionCheckBox(props) {
    return (
      <div className="col-lg-4 col-md-6 col-sm-12">
        <label>
          <input className="permission-checkbox"
                 type="checkbox"/>
            &nbsp; { props.username }
        </label>
      </div>
    )
               // defaultChecked={false} onChange={(e) => props.permissionUpdate(props.permission.user_id, e.target.checked)}/>
}

export default PermissionForm;
