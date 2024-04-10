export async function wait(time: number) {
  return new Promise((resolve: Function) => {
    setTimeout(resolve, time);
  });
}

export function decode_jwt(token: string) {
  try {
    if (token) {
      return JSON.parse(atob(token.split(".")[1]));
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

export function encode_jwt(...parts: Array<any>) {
  let jwt = [];
  for (let part of parts) {
    jwt.push(btoa(encode_json(part)));
  }
  return jwt.join(".");
}

// AJAX Overrides
export type OverrideDataXHR = {
  name: string;
  data: {
    status: number;
    response_text: string;
    request_url: string | URL;
    response_url: string;
    request_headers: any;
    response_headers?: any;
  };
};

export type OverrideDataFetch = {
  name: string;
  data: {
    status: number;
    response_text: string;
    response_url: string;
    request_url: string | URL;
    request_text: string;
    response_headers: any;
    response_body: any;
  };
};

export function override_xhr(window: Window, callback: (message: OverrideDataXHR) => void) {
  var _open = XMLHttpRequest.prototype.open;
  var _setRequestHeader = (window["XMLHttpRequest"] as typeof XMLHttpRequest).prototype.setRequestHeader;

  (window["XMLHttpRequest"] as typeof XMLHttpRequest).prototype.setRequestHeader = function (name: string, value: string) {
    if (!this["chromane_request_headers"]) {
      this["chromane_request_headers"] = {};
    }

    this["chromane_request_headers"][name] = value;

    return _setRequestHeader.apply(this, arguments as any);
  };

  (window["XMLHttpRequest"] as typeof XMLHttpRequest).prototype.open = function (_method: string, request_url: string | URL) {
    this.addEventListener("load", (_event) => {
      if ((this.readyState === 4 && this.status === 200 && this.responseType === "text") || this.responseType === "") {
        const message: OverrideDataXHR = {
          name: "xhr_response_captured",
          data: {
            status: this.status,
            response_text: this.responseText,

            request_url: request_url,
            response_url: this.responseURL,

            request_headers: this["chromane_request_headers"],
            // response_headers: this.getAllresponseHeaders(),
          },
        };
        callback(message);
      }
      if (this.responseType === "blob") {
        const blob = this.response as Blob;
        const reader = new FileReader();

        reader.onload = (event: ProgressEvent<FileReader>): void => {
          const response = event.target?.result as string;
          const message: OverrideDataXHR = {
            name: "xhr_response_captured",
            data: {
              status: this.status,
              response_text: response,

              request_url: request_url,
              response_url: this.responseURL,

              request_headers: this["chromane_request_headers"],
            },
          };
          callback(message);
        };
        reader.readAsText(blob);
      }
    });

    return _open.apply(this, arguments as any);
  };
}

export function override_fetch(window: Window, callback: (message: OverrideDataFetch) => void) {
  var _fetch = window.fetch;

  window.fetch = async function (_request_url: RequestInfo | URL, _options: RequestInit | undefined) {
    var request, url;
    if (arguments[0] instanceof Request) {
      request = arguments[0];
      url = request.url;
    } else {
      request = arguments[1];
      url = arguments[0];
    }

    var request_text;
    if (request instanceof Request) {
      var request_clone = request.clone();
      request_text = await request_clone.text();
    } else {
      request_text = "";
    }

    var response = await _fetch.apply(window, arguments as any);
    var response_clone = response.clone();
    var response_text = await response_clone.text();

    // console.log(response_text);

    var message: OverrideDataFetch = {
      name: "fetch_response_captured",
      data: {
        status: response_clone.status,
        response_text: response_text,
        response_url: url,

        request_url: url,
        request_text,
        // request_options: options,
        response_headers: {},
        response_body: {},
      },
    };

    if (arguments[1] && arguments[1].headers) {
      if (arguments[1].headers instanceof Headers) {
        message.data.response_headers = {};

        for (var pair of arguments[1].headers.entries()) {
          message.data.response_headers[pair[0]] = pair[1];
        }
      } else {
        message.data.response_headers = arguments[1].headers;
      }
    }

    if (arguments[1] && arguments[1].body) {
      message.data.response_body = arguments[1].body;
    }

    callback(message);

    return response;
  };
}

export function decode_json<T>(text: string | null): T | null {
  if (text === null) return null;
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    return null;
  }
}

export function encode_json(json: object): string {
  return JSON.stringify(json);
}

export function get_google_auth_url(google_cloud_oauth_client_id, redirect_uri, scopes, state_obj) {
  let url_root = `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount`;
  // state will be passed to the chrome-extnesion/id/redirect page
  let state = btoa(encode_json(state_obj));
  // [ name, value ] pairs
  let params = [
    ["access_type", "offline"],
    ["prompt", "select_account"],
    ["include_granted_scopes", "true"],
    ["response_type", "code"],
    ["service", "lso"],
    ["o2v", "2"],
    ["theme", "glif"],
    ["flowName", "GeneralOAuthFlow"],
    ["client_id", google_cloud_oauth_client_id],
    ["redirect_uri", redirect_uri],
    ["state", state],
    ["scope", scopes.join(" ")],
  ];
  console.log("params", params);
  let param_str = params
    .map(([name, value]) => {
      return `${name}=${encodeURIComponent(value)}`;
    })
    .join("&");
  //
  let auth_page_url = `${url_root}?${param_str}`;
  return auth_page_url;
}

export function get_id() {
  return Date.now().toString(36) + Math.floor(Math.random() * 1_000_000_000_000).toString(36);
}

export function get_code() {
  return Math.floor(1_000_000_000 + Math.random() * 1_000_000_000_000)
    .toString(36)
    .slice(0, 6)
    .toUpperCase();
}

export function url_to_params(url: string) {
  let params: any = {};
  try {
    let str = url.split("?")[1];
    let split_1 = str.split("&");
    for (let item of split_1) {
      let split_2 = item.split("=");
      let name = decodeURIComponent(split_2[0]);
      let value = decodeURIComponent(split_2[1]);
      params[name] = value;
    }
    return params;
  } catch (e) {
    return params;
  }
}

export function compare(obj_1, obj_2) {
  if (obj_1 === obj_2) {
    return true;
  } else if (obj_1 instanceof Date && obj_2 instanceof Date) {
    return obj_1.getTime() === obj_2.getTime();
  } else if (obj_1 === null && obj_2 === null) {
    return true;
  } else if (typeof obj_1 === "object" && typeof obj_2 === "object" && obj_1 !== null && obj_2 !== null) {
    var key_arr_1 = Object.keys(obj_1);
    var key_arr_2 = Object.keys(obj_2);
    var equal;

    for (var i = key_arr_1.length; i--; ) {
      equal = this.compare(obj_1[key_arr_1[i]], obj_2[key_arr_1[i]]);

      if (equal === false) {
        return false;
      }
    }

    for (var i = key_arr_2.length; i--; ) {
      equal = this.compare(obj_1[key_arr_2[i]], obj_2[key_arr_2[i]]);

      if (equal === false) {
        return false;
      }
    }

    return true;
  } else {
    return false;
  }
}

export function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
