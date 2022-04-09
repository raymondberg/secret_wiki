import { BrowserRouter as Router } from "react-router-dom";
import { React, useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";

import "./App.css";
import "./react-toggle.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { LoginModal } from "./components/pages/LoginModal";
import Main from "./components/Main";
import { updateUsers } from "./shared/userSlice";

function App() {
  const crossDomain = process.env.NODE_ENV !== "production";
  const apiRoot = !crossDomain ? "/api" : "http://localhost:8000/api";

  const [cookies, setCookie] = useCookies(["access_token"]);
  const [jwt, setJwt] = useState(cookies.access_token);

  const dispatch = useDispatch();

  useEffect(() => {
    if (jwt !== undefined && jwt !== null) {
      apiWrapper()
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

  function apiWrapper() {
    function get(url) {
      if (jwt === null) {
        console.log("tried request without jwt");
      }
      var headers = {
        crossDomain: crossDomain,
        Authorization: `Bearer ${jwt}`,
      };

      return fetch(`${apiRoot}/${url}`, {
        headers: headers,
      }).then(function (response) {
        if (response.status === 401) {
          updateJwt(null);
        }
        return response;
      });
    }

    function post(url, body, includeBearer = true) {
      var headers = {
        crossDomain: crossDomain,
      };

      var postBody = null;
      if (includeBearer) {
        headers.Authorization = `Bearer ${jwt}`;
        headers["Content-Type"] = "application/json";
        postBody = JSON.stringify(body);
      } else {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        postBody = Object.keys(body)
          .map(
            (key) =>
              encodeURIComponent(key) + "=" + encodeURIComponent(body[key])
          )
          .join("&");
      }

      return fetch(`${apiRoot}/${url}`, {
        method: "POST",
        headers: headers,
        body: postBody,
      });
    }

    function remove(url) {
      if (jwt === null) {
        console.log("tried delete without jwt");
      }
      var headers = {
        crossDomain: crossDomain,
        Authorization: `Bearer ${jwt}`,
      };

      return fetch(`${apiRoot}/${url}`, {
        headers: headers,
        method: "DELETE",
      }).then(function (response) {
        if (response.status === 401) {
          updateJwt(null);
        }
        return response;
      });
    }

    return {
      get: get,
      post: post,
      delete: remove,
      isLoggedIn: function () {
        return jwt !== null && jwt !== undefined;
      },
    };
  }

  var api = apiWrapper();

  return (
    <Router>
      <Main api={api} />
      <LoginModal api={api} shouldShow={!api.isLoggedIn()} setJwt={updateJwt} />
    </Router>
  );
}

export default App;
