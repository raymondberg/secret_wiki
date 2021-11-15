import React from "react";
import Toggle from "react-toggle";

export default function Status(props) {
   return (
      <div id="status" className="p-2">
       <label>
         <Toggle
           defaultChecked={props.editMode}
           icons={{
             checked: <div className='pencil'>✏️</div>,
             unchecked: null,
            }}
           onChange={(e) => props.setEditMode(e.target.checked)} />
       </label>
     </div>
    )
}
