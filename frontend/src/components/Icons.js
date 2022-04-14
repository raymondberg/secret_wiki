import React from "react";

export function LockedIcon() {
  return <React.Fragment>&#128274;</React.Fragment>;
}

export function UnlockedIcon() {
  return <React.Fragment>&#128275;</React.Fragment>;
}

export function getLock(isLocked = true) {
  return isLocked ? <LockedIcon /> : <UnlockedIcon />;
}

export function EditIcon() {
  return <React.Fragment>&#128221;</React.Fragment>;
}
