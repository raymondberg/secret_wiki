import { BrowserRouter as Router } from "react-router-dom";
import { React, useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";

import "./App.css";
import "./react-toggle.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { LoginModal } from "./components/pages/LoginModal";
import Main from "./components/Main";
import ApiWrapper from "./ApiWrapper";
import { updateUsers } from "./shared/userSlice";

function App() {
  const crossDomain = process.env.NODE_ENV !== "production";
  const apiRoot = !crossDomain ? "/api" : "http://localhost:8000/api";
  const [cookies, setCookie] = useCookies(["access_token"]);
  const [jwt, setJwt] = useState(cookies.access_token);
  const api = ApiWrapper(apiRoot, jwt, updateJwt, crossDomain);

  const dispatch = useDispatch();

  useEffect(() => {
    if (jwt !== undefined && jwt !== null) {
      api
        .get("u")
        .then((res) => res.json())
        .then((returnedUsers) => {
          dispatch(updateUsers(returnedUsers));
        });
    }
  });

  function updateJwt(newJwt) {
    setCookie("access_token", newJwt);
    setJwt(newJwt);
  }

  return (
    <Router>
      <Main api={api} />
      <LoginModal api={api} shouldShow={!api.isLoggedIn()} setJwt={updateJwt} />
    </Router>
  );
}

export default App;
