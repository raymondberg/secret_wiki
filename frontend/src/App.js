import { React, useState} from "react";
import { BrowserRouter as Router} from "react-router-dom";
import Main from "./components/Main";
import LoginModal from "./components/LoginModal";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const crossDomain = process.env.NODE_ENV !== 'production'
    const apiRoot = (!crossDomain)? "/api": "http://localhost:8000/api"

    const [jwt, setJwt] = useState(null);

    function apiWrapper() {
      function get(url) {
        if (jwt === null ) {
          console.log('tried request without jwt')
        }
        var headers = {
          crossDomain: crossDomain,
          Authorization: `Bearer ${jwt}`
        }

        return fetch(`${apiRoot}/${url}`, {
          headers: headers,
        })
      }

      function post(url, body, includeBearer=true) {
        var headers = {
          crossDomain: crossDomain,
        }

        var postBody = null
        if (includeBearer) {
          headers.Authorization = `Bearer ${jwt}`
          headers['Content-Type'] = 'application/json'
          postBody = JSON.stringify(body)
        } else {
          headers['Content-Type'] = 'application/x-www-form-urlencoded'
          postBody = Object.keys(body).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(body[key])).join('&')
        }

        return fetch(`${apiRoot}/${url}`, {
          method: 'POST',
          headers: headers,
          body: postBody,
        })
      }
      return {get: get, post: post, isLoggedIn: () => jwt !== null}
    }


    var api = apiWrapper()

    return (
      <Router>
        <Main api={api}/>
        <LoginModal api={api}
                       shouldShow={!api.isLoggedIn()}
                       setJwt={setJwt}/>
      </Router>
    )
}

export default App;
