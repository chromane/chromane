// todo: improve logging functionality
import util from "@chromane/shared/ts/util";
import type BackendDefault from "@chromane/back/ts/BackendDefault";
// types
import { BackendCodes, BackendResponse } from "@chromane/shared/types/types";
import CloudIframe from "./CloudIframe";
//
export default class FirebaseManager {
  // properties
  store: any;
  ext_config: any;
  config: any;
  ctrl: CloudIframe;
  backend_proxy: BackendDefault;
  constructor(ctrl, ext_config, store, shared_config) {
    //
    this.ctrl = ctrl;
    this.ext_config = ext_config;
    this.config = shared_config;
    this.store = store;
    let _this = this;
    //
    this.backend_proxy = {
      // @ts-ignore
      modules: new Proxy(
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
                    return _this.backend(`${String(module_name)}.${String(method_name)}`, args);
                    //
                  };
                },
              }
            );
          },
        }
      ),
    };
    //
  }

  // basic auth
  async log_in(email, password) {
    this.store.ui_number_of_blocking_operations += 1;
    let auth_r = await this.ctrl.backend_module.log_in_with_email(email, password);
    this.store.ui_number_of_blocking_operations -= 1;
    return auth_r;
  }
  async sign_in_with_google_code(code) {
    this.store.ui_number_of_blocking_operations += 1;
    let auth_r = await this.ctrl.backend_module.sign_in_with_google_code(code);
    await this.after_successfully_auth(auth_r.access_token, auth_r.refresh_token);
    this.store.ui_number_of_blocking_operations -= 1;
    return auth_r;
  }
  // complex auth
  async after_successfully_auth(access_token, refresh_token) {
    this.store.auth = {
      access_token,
      refresh_token,
      claims: util.decode_jwt(access_token),
    };
    this.ctrl.proxy_extension_iframe.storage_set({ auth: util.clone(this.store.auth) });
    await this.ctrl.after_successfully_auth();
    this.ctrl.goto("main");
    // let doc = await this.load_user_data();
    // if (doc) {
    //   this.store.auth.doc = doc;
    // }
    // this.ctrl.proxy_extension_iframe.storage_set({ auth: util.clone(this.store.auth) });
  }
  async load_user_data() {
    this.store.ui_number_of_blocking_operations += 1;
    // @ts-ignore
    let user_doc_r = await this.backend_proxy.modules.chromane.get_user_data("_token_");
    let claims = this.store.auth.claims;
    let user_doc = user_doc_r.result;
    // verify that the current token has the latest claims
    console.log("user_doc", user_doc);
    console.log("claims", claims);
    //
    // if (user_doc) {
    //   for (let claim_name of jwt_claims) {
    //     if (
    //       //
    //       user_doc.hasOwnProperty(claim_name) === true &&
    //       // claims.hasOwnProperty(claim_name) === true &&
    //       user_doc[claim_name] !== claims[claim_name]
    //     ) {
    //       await this.refresh_token();
    //     }
    //   }
    // }
    //
    this.store.ui_number_of_blocking_operations -= 1;
    return user_doc;
  }
  get_auth_url(scopes, state_obj) {
    let url_root = `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount`;
    // state will be passed to the chrome-extnesion/id/redirect page
    let state = btoa(util.encode_json(state_obj));
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
      ["client_id", this.ext_config.google_cloud_oauth_client_id],
      ["redirect_uri", `${this.config.urls.backend_root}/${this.ext_config.backend_module_name}.redirect`],
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
  async sign_in_with_google() {
    let extension_id = await this.ctrl.proxy_extension_iframe.get_extension_id();
    let auth_page_url = this.get_auth_url(["openid", "profile", "email"], {
      extension_id,
      flow_type: "log_in",
    });
    // this.ctrl.proxy_extension_iframe.tabs_create({ url: auth_page_url, active: true });
    console.log(auth_page_url);
    window.open(auth_page_url);
  }
  async load_google_tokens(scopes) {
    let extension_id = await this.ctrl.proxy_extension_iframe.get_extension_id();
    let auth_page_url = this.get_auth_url(scopes, { extension_id, flow_type: "load_tokens" });
    this.ctrl.proxy_extension_iframe.tabs_create({ url: auth_page_url, active: true });
  }
  // backend communication
  async get_backend_response(endpoint, args?) {
    try {
      //
      args = args.map((arg) => {
        if (arg === "_token_") {
          if (this.store.auth && this.store.auth.access_token) {
            return this.store.auth.access_token;
          } else {
            return "";
          }
        } else {
          return arg;
        }
      });
      //
      let fetch_url = `${this.config.urls.backend_root}/${endpoint}`;
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
  async refresh_token(): Promise<boolean> {
    try {
      const r = await fetch(`https://securetoken.googleapis.com/v1/token?key=${this.ext_config.firebase_config.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "refresh_token",
          refresh_token: this.store.auth.refresh_token,
        }),
      });
      const json = (await r.json()) as any;
      if (!json.access_token || !json.refresh_token) {
        return false;
      }
      this.store.auth = {
        refresh_token: json.refresh_token,
        access_token: json.access_token,
        claims: util.decode_jwt(json.access_token),
      };
      this.ctrl.proxy_extension_iframe.storage_set({ auth: util.clone(this.store.auth) });
      return true;
    } catch (e) {
      return false;
    }
  }
  //
}
