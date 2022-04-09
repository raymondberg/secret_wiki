import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export function LoginModal(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function validateForm() {
    return email.length > 0 && password.length > 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    props.api
      .post("auth/jwt/login", { username: email, password: password }, false)
      .then((res) => res.json())
      .then(
        (authResponse) => {
          if (authResponse.detail !== undefined) {
            if (authResponse.detail === "LOGIN_BAD_CREDENTIALS") {
              alert("Invalid username or password");
            } else {
              alert(
                "Failed to login: " +
                  authResponse.detail.map((e) => `${e.loc}: ${e.msg}`).join(",")
              );
            }
          } else {
            props.setJwt(authResponse.access_token);
          }
        },
        (e) => {
          alert(e);
        }
      );
  }

  return (
    <Modal
      show={props.shouldShow}
      onHide={props.handleClose}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group size="lg" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              autoFocus
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group size="lg" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Button
            block="true"
            size="lg"
            type="submit"
            disabled={!validateForm()}
          >
            Login
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default LoginModal;
