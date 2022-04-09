export function Gutter(props) {
   return (
      <div className="page-section-gutter" sectionindex={props.sectionIndex}
           onDoubleClick={(e) => props.editCallback(props.sectionIndex)}/>
    )
}

export default Gutter;
