export function is_string(obj) {
  return typeof obj === "string";
}
export function is_number(obj) {
  return typeof obj === "number";
}
export function is_nan(obj) {
  return typeof obj === "number" && isNaN(obj);
}
export function is_undefined(value) {
  return typeof value === "undefined";
}
export function is_null(obj) {
  return obj === null;
}
export function is_function(obj) {
  return typeof obj === "function";
}
export function is_array(obj) {
  return Array.isArray(obj);
}
export function is_bool(obj) {
  return typeof obj === "boolean";
}
export function is_simple_object(obj) {
  return Object.prototype === Object.getPrototypeOf(obj);
}

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

export function encode_url_state(json: any) {
  return encodeURIComponent(btoa(encode_json(json)));
}

export function decode_url_state(state: string) {
  return decode_json(atob(decodeURIComponent(state)));
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

export function html_entity_decode(text: string) {
  var entities = [
    ["amp", "&"],
    ["apos", "'"],
    ["#x27", "'"],
    ["#x2F", "/"],
    ["#39", "'"],
    ["#47", "/"],
    ["lt", "<"],
    ["gt", ">"],
    ["nbsp", " "],
    ["quot", '"'],
  ];

  for (var i = 0, max = entities.length; i < max; ++i) {
    text = text.replace(new RegExp("&" + entities[i][0] + ";", "g"), entities[i][1]);
  }

  return text;
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

export function html_to_doc(html) {
  let parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

export function clone<T>(obj: T): T | null {
  try {
    return JSON.parse(JSON.stringify(obj)) as T;
  } catch (e) {
    return null;
  }
}

export function find_objects_with_props(root_obj: any, props_arr: Array<string>) {
  let result_arr: Array<any> = [];
  let object_arr = [root_obj];
  loop_1: for (let i = 0; i < object_arr.length; i++) {
    let current_obj = object_arr[i];
    // console.log("current_obj", current_obj);
    if (
      //
      is_null(current_obj) === false &&
      (is_simple_object(current_obj) || is_array(current_obj)) === true
    ) {
      // Check if the current object has all the required properties
      // that we are looking for
      let all_props_found = true;
      loop_2: for (let prop of props_arr) {
        if (current_obj.hasOwnProperty(prop) === false) {
          all_props_found = false;
          break loop_2;
        }
      }
      if (all_props_found) {
        result_arr.push(current_obj);
      } else {
        // If this object is not what we are looking for -
        // Add all of it's children for futher review
        for (let key in current_obj) {
          // console.log("key", key);
          object_arr.push(current_obj[key]);
        }
      }
    }
  }
  return result_arr;
}
export function find_objects_with_values(root_obj: any, values_arr: Array<Array<any>>) {
  let result_arr: Array<any> = [];
  let object_arr = [root_obj];
  loop_1: for (let i = 0; i < object_arr.length; i++) {
    let current_obj = object_arr[i];
    // console.log("current_obj", current_obj);
    if (
      //
      is_null(current_obj) === false &&
      (is_simple_object(current_obj) || is_array(current_obj)) === true
    ) {
      // Check if the current object has all the required properties
      // that we are looking for
      let all_props_found = true;
      loop_2: for (let [prop, value] of values_arr) {
        if (current_obj[prop] !== value) {
          all_props_found = false;
          break loop_2;
        }
      }
      if (all_props_found) {
        result_arr.push(current_obj);
      } else {
        // If this object is not what we are looking for -
        // Add all of it's children for futher review
        for (let key in current_obj) {
          // console.log("key", key);
          object_arr.push(current_obj[key]);
        }
      }
    }
  }
  return result_arr;
}

export function arr_last(arr: Array<any>) {
  return arr[arr.length - 1];
}

export async function wait_for_element<T extends HTMLElement>(selector: string): Promise<T | null> {
  for (let i = 0; i < 1000; i++) {
    let element = document.querySelector<T>(selector);
    if (element) {
      return element;
    } else {
      await wait(100);
    }
  }
  return null;
}
