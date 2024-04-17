// @ts-ignore
let mode = CHROMANE_CONFIG_MODE as "prod" | "dev" | "test";
// @ts-ignore
// let config_json = CHROMANE_CONFIG_JSON;

import config_json from "./config.json";
let { fb_id, extension_id } = config_json;
//
// old config
// todo: remove this
if (mode === "prod") {
  var fn_root = "https://us-central1-chromane-extension.cloudfunctions.net/main";
} else {
  var fn_root = "http://localhost:5001/chromane-extension/us-central1/main";
}
if (mode === "prod") {
  var versions_root = `https://cdn.chromane.com/x/${config_json.ext_name}`;
} else {
  var versions_root = "http://localhost:5000";
}
if (mode === "prod") {
  var hosting_root = `https://cdn.chromane.com/x/${config_json.ext_name}`;
} else {
  var hosting_root = "http://localhost:2140";
}

//
let urls = {
  // for testing extension iframes in prj_frontend localhost
  test: {
    backend_root_old: `http://localhost:5001/${fb_id}/us-central1/main`,
    backend_root: `http://localhost:8080`,
    //
    onboarding: `chrome-extension://${extension_id}/pages/onboarding/index.html`,
    offboarding: `https://super-reply-dbaf0.web.app/#/uninstall`,
    frontend_root: `http://localhost:2140`,
    firebase_hosting_root: `http://localhost:5000`,
    onboarding_url: `http://localhost:2140`,
    extension_iframe: `http://localhost:2140/extension_iframe/`,
    extension_onboarding: `http://localhost:2140/extension_onboarding/`,
    extension_iframe_small: `http://localhost:2140/extension_iframe_small`,
    //
    static_root: `http://localhost:2140/static`,
    //
    firebase_iframe_origin: `http://localhost:2140`,
    firebase_iframe: `http://localhost:2140/iframe/`,
    firebase_popup: `http://localhost:2140/popup/`,
    firebase_iframe_small: `http://localhost:2140/iframe_small`,
    firebase_onboarding: `http://localhost:2140/onboarding`,
  },
  // for installing extension locally
  dev: {
    backend_root_old: `http://localhost:5001/${fb_id}/us-central1/main`,
    backend_root: `http://localhost:8080`,
    //
    onboarding: `chrome-extension://${extension_id}/pages/onboarding/index.html`,
    offboarding: `https://super-reply-dbaf0.web.app/#/uninstall`,
    frontend_root: `http://localhost:2140`,
    firebase_hosting_root: `http://localhost:5000`,
    onboarding_url: `http://localhost:2140`,
    extension_iframe: `chrome-extension://${extension_id}/pages/iframe/index.html`,
    extension_onboarding: `chrome-extension://${extension_id}/pages/onboarding/index.html`,
    extension_iframe_small: `chrome-extension://${extension_id}/pages/iframe_small/index.html`,
    //
    static_root: `http://localhost:2140/static`,
    //
    firebase_iframe_origin: `http://localhost:2140`,
    firebase_iframe: `http://localhost:2140/iframe/`,
    firebase_popup: `http://localhost:2140/popup/`,
    firebase_iframe_small: `http://localhost:2140/iframe_small`,
    firebase_onboarding: `http://localhost:2140/onboarding`,
  },
  // production
  // {version_frontend} cannot be replaced at this stage
  // because it will be different for different chrome extnesion
  // packages in the wild
  prod: {
    backend_root_old: `https://us-central1-${fb_id}.cloudfunctions.net/main`,
    backend_root: `https://back.chromane.com/main`,
    //
    onboarding: `chrome-extension://${extension_id}/pages/onboarding/index.html`,
    offboarding: `https://super-reply-dbaf0.web.app/#/uninstall`,
    frontend_root: `https://${fb_id}.web.app`,
    onboarding_url: `https://${fb_id}.web.app`,
    extension_iframe: `chrome-extension://${extension_id}/pages/iframe/index.html`,
    extension_onboarding: `chrome-extension://${extension_id}/pages/onboarding/index.html`,
    extension_iframe_small: `chrome-extension://${extension_id}/pages/iframe_small/index.html`,
    firebase_hosting_root: `https://${fb_id}.web.app`,
    //
    static_root: `https://cdn.chromane.com/x/${config_json.ext_name}/static`,
    //
    firebase_iframe_origin: `https://cdn.chromane.com`,
    firebase_iframe: `https://cdn.chromane.com/x/${config_json.ext_name}/{version_frontend}/iframe/index.html`,
    firebase_popup: `https://cdn.chromane.com/x/${config_json.ext_name}/{version_frontend}/popup/index.html`,
    firebase_iframe_small: `https://cdn.chromane.com/x/${config_json.ext_name}/{version_frontend}/iframe_small/index.html`,
    firebase_onboarding: `https://cdn.chromane.com/x/${config_json.ext_name}/{version_frontend}/onboarding/index.html`,
    //
  },
};
export default {
  // legacy;
  // todo: remove
  fn_root,
  versions_root,
  hosting_root,
  //
  title: "Chromane",
  mode,
  fb_id,
  ext_id: extension_id,
  extension_id,
  get urls() {
    return urls[this.mode];
  },
  config_json,
};
