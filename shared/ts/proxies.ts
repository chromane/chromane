import { get_id } from "./helpers";
import util from "./util";

class Proxies {
  iwn_wait_for_first_iframe_registration_promise_hash = {};
  iwn_first_iframe_registration_resolver_hash = {};
  iwn_window_wraps = {};
  iwn_windows = {};
  iwn_listener_was_added_flag = false;
  resolvers: any = {};
  create_proxy_from_iframe_name<TargetType>(extension_id_param, iframe_name: string) {
    console.log("set_popup_progress_status123123", extension_id_param, iframe_name);
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
            // console.log("args", prop, args);
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
    console.log("create_window_proxy", extension_id, window_this, window_target);
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
      // console.log("event", event);
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
            console.log("window_api_error", location.href, name, e);
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
}
export default new Proxies();
