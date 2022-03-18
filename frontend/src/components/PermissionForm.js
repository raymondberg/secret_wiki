
export default function PermissionForm(props) {
  return (
    <div class="row">
     {props.permissions.map((p) => <PermissionCheckBox permission={p} permissionUpdate={props.permissionUpdate} />)}
    </div>
  )
}

function PermissionCheckBox(props) {
    return (
      <div class="col-lg-2 col-md-4 col-sm-12">
        <input class="permission-checkbox"
               type="checkbox"
               defaultChecked={false} onChange={(e) => props.permissionUpdate(props.permission.user_id, e.target.checked)}/>
          &nbsp; { props.permission.username }
      </div>
    )
}
