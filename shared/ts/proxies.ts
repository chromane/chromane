import { get_id } from "./helpers";
import util from "./util";
import { BackendResponse, BackendCodes } from "../types/types";

class Proxies {
  iwn_wait_for_first_iframe_registration_promise_hash = {};
  iwn_first_iframe_registration_resolver_hash = {};
  iwn_window_wraps = {};
  iwn_windows = {};
  iwn_listener_was_added_flag = false;
  resolvers: any = {};
  create_proxy_from_iframe_name<TargetType>(extension_id_param, iframe_name: string) {
    this.iwn_wait_for_first_iframe_registration_promise_hash[iframe_name] = new Promise((r) => {
      this.iwn_first_iframe_registration_resolver_hash[iframe_name] = r;
    });
    if (this.iwn_listener_was_added_flag === false) {
      this.iwn_listener_was_added_flag = true;
      let listener = (event) => {
        if (event.data && event.data.name === "register_iframe") {
          let { iframe_name, extension_id } = event.data.data;
          if (extension_id === extension_id_param) {
            let iframe_window = event.source;
            this.iwn_windows[iframe_name] = event.source;
            this.iwn_window_wraps[iframe_name] = this.create_window_wrap(extension_id, window, iframe_window);
            this.iwn_first_iframe_registration_resolver_hash[iframe_name]();
          }
        }
      };
      window.addEventListener("message", listener);
    }
    //
    let _this = this;
    let proxy = new Proxy(
      {},
      {
        get(target, prop) {
          return async (...args: any[]) => {
            let name = prop;
            let data = args;
            if (name === "get_window") {
              // return () => {
              return _this.iwn_windows[iframe_name];
              // };
            } else {
              await _this.iwn_wait_for_first_iframe_registration_promise_hash[iframe_name];
              let wrap = _this.iwn_window_wraps[iframe_name];
              return wrap.exec(name, data);
            }
          };
        },
      }
    );
    return proxy as TargetType;
  }
  create_window_proxy<TargetType>(extension_id, window_this, window_target) {
    let wrap = this.create_window_wrap(extension_id, window_this, window_target);
    let proxy = new Proxy(
      {},
      {
        get(target, prop) {
          return async (...args: any[]) => {
            return wrap.exec(prop.toString(), args);
          };
        },
      }
    );
    return proxy as TargetType;
  }
  create_window_wrap(extension_id, window, target_window) {
    //
    window.addEventListener("message", async (event) => {
      if (event.data) {
        let name = event.data.name;
        let meta = event.data.meta;
        let data = event.data.data;
        if (name === "exec_result" && meta && meta.response && this.resolvers[meta.request_id]) {
          this.resolvers[meta.request_id](data.result);
          delete this.resolvers[meta.request_id];
        }
      }
    });
    return {
      exec: (name, data?: any) => {
        return new Promise((r) => {
          let request_id = get_id();
          this.resolvers[request_id] = r;
          let meta = {
            request_id,
            request: true,
            extension_id,
          };
          target_window.postMessage({ name, meta, data }, "*");
        });
      },
    };
  }
  create_window_api(extension_id, instance, allowed_origin) {
    window.addEventListener("message", async (event) => {
      if (event.data) {
        let name = event.data.name;
        let meta = event.data.meta;
        let data = event.data.data;
        if (
          //
          (event.origin === allowed_origin || allowed_origin === "*") &&
          meta &&
          meta.extension_id === extension_id &&
          instance[name]
        ) {
          try {
            var result: any = await instance[name].apply(instance, data);
          } catch (e) {
            console.log("proxy_error", e);
            var result: any = null;
          }
          if (event.source) {
            let source = event.source as Window;
            source.postMessage(
              {
                name: "exec_result",
                meta: {
                  response: true,
                  request_id: meta.request_id,
                },
                data: { result },
              },
              allowed_origin
            );
          }
        }
      }
    });
  }
  // backend server proxy
  create_proxy_backend<TargetType>(backend_root) {
    let _this = this;
    let proxy = new Proxy(
      {},
      {
        get(target, module_name) {
          return new Proxy(
            {},
            {
              get(target, method_name) {
                return async (...args: any[]) => {
                  console.log("args", module_name, args);
                  //
                  console.log("module_name", module_name);
                  console.log("method_name", method_name);
                  return _this.backend(`${backend_root}/${String(module_name)}.${String(method_name)}`, args);
                  //
                };
              },
            }
          );
        },
      }
    );
    return proxy as TargetType;
  }
  async backend(endpoint, args?): Promise<BackendResponse<any>> {
    let backend_response = await this.get_backend_response(endpoint, args);
    if (backend_response.code === BackendCodes.AUTH_TOKEN_EXPIRED) {
      let result = await this.refresh_token();
      if (result) {
        let backend_response = await this.get_backend_response(endpoint, args);
        return backend_response;
      } else {
        return {
          success: false,
          code: "ERROR_IN_TOKEN_REFRESH",
          result: null,
        } as BackendResponse<any>;
      }
    } else {
      return backend_response;
    }
  }
  async get_backend_response(endpoint, args?) {
    try {
      //
      args = args.map((arg) => {
        if (arg === "_token_") {
          if (this.store && this.store.auth && this.store.auth.access_token) {
            return this.store.auth.access_token;
          } else {
            return "";
          }
        } else {
          return arg;
        }
      });
      //
      let fetch_url = endpoint;
      let fetch_data: any = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: args ? args : {},
        }),
      };
      let r = await fetch(fetch_url, fetch_data);
      let text = await r.text();
      let json = await util.decode_json(text);
      if (json) {
        return json as BackendResponse<any>;
      } else {
        return {
          success: false,
          code: "ERROR_IN_JSON",
          result: null,
        } as BackendResponse<any>;
      }
    } catch (e) {
      console.log(e);
      return {
        success: false,
        code: "ERROR_IN_FETCH",
        result: null,
      } as BackendResponse<any>;
    }
  }
  //
}
export default new Proxies();
