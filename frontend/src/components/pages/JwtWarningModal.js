import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function JwtWarningModal(props) {
  const [time, setTime] = useState(null);
  const expirationWarningTime = props.expiration - 60;

  const [acknowledgeRisk, setAcknowledgeRisk] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now() / 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (time > props.expiration + 1) {
    window.location.reload();
  }

  return (
    <Modal
      show={
        props.isLoggedIn && time > expirationWarningTime && !acknowledgeRisk
      }
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        <Modal.Title>
          Hey! You will be logged out in{" "}
          {Math.max(0, parseInt(props.expiration - time))} seconds. Save your
          work.
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Button
          variant="secondary"
          onClick={() => {
            setAcknowledgeRisk(true);
          }}
        >
          I get it. I promise to save and refresh quickly!
        </Button>
      </Modal.Body>
    </Modal>
  );
}
