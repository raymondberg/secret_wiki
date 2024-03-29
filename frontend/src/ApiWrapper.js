export default function ApiWrapper(apiRoot, jwt, updateJwt, crossDomain) {
  function get(url, signal) {
    if (jwt === null) {
      console.log("tried request without jwt");
    }
    const headers = {
      crossDomain,
      Authorization: `Bearer ${jwt}`,
    };

    return fetch(`${apiRoot}/${url}`, {
      headers,
      signal,
    }).then(function (response) {
      if (response.status === 401) {
        updateJwt(null);
      }
      return response;
    });
  }

  function post(url, body, includeBearer = true) {
    let headers = {
      crossDomain: crossDomain,
    };

    let postBody = null;
    if (includeBearer) {
      headers.Authorization = `Bearer ${jwt}`;
      headers["Content-Type"] = "application/json";
      postBody = JSON.stringify(body);
    } else {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      postBody = Object.keys(body)
        .map(
          (key) => encodeURIComponent(key) + "=" + encodeURIComponent(body[key])
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
    const headers = {
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

  function logout(url) {
    updateJwt(null);
  }

  return {
    get: get,
    post: post,
    delete: remove,
    logout: logout,
    isLoggedIn: function () {
      return jwt !== null && jwt !== undefined;
    },
  };
}
