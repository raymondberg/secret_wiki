import { BrowserRouter as Router } from "react-router-dom";
import { React, useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";

import "./App.css";
import "./react-toggle.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@webscopeio/react-textarea-autocomplete/style.css";
import LoginModal from "./components/pages/LoginModal";
import JwtWarningModal from "./components/pages/JwtWarningModal";
import Main from "./components/Main";
import ApiWrapper from "./ApiWrapper";
import { updateUsers } from "./shared/userSlice";
import { updateWikis } from "./shared/wikiSlice";

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

      api
        .get("w")
        .then((res) => res.json())
        .then((returnedWikis) => {
          if (Array.isArray(returnedWikis)) {
            let wikis = returnedWikis.map((w) =>
              Object.assign({ last_probe_time: Date.now() }, w)
            );
            dispatch(updateWikis(wikis));
          }
        });
    }
  }, [api, jwt, dispatch]);

  function updateJwt(newJwt) {
    setCookie("access_token", newJwt);
    setJwt(newJwt);
  }

  let jwtObject = null;
  if (jwt !== null && jwt !== undefined) {
    try {
      jwtObject = JSON.parse(atob(jwt.split(".")[1]));
    } catch (err) {}
  }

  return (
    <Router>
      <Main api={api} />
      <LoginModal api={api} shouldShow={!api.isLoggedIn()} setJwt={updateJwt} />
      <JwtWarningModal
        isLoggedIn={api.isLoggedIn()}
        expiration={jwtObject?.exp}
      />
    </Router>
  );
}

export default App;
