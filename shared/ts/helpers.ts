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
