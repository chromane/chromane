// import ExtensionIframe from "@shared/ts/ExtensionIframe";
// import wrap_parent from "@common/ts/wrap_parent";
// import util from "chromane/shared/ts/util";
// import config from "@shared/config";
// util.set_mode(config.mode);

// util.wrap_class(ExtensionIframe, []);
// let instance = new ExtensionIframe();
// util.create_window_api(instance);

// instance.init("firebase_iframe");

// if (window.name === "chromane-popup") {
//     document.documentElement.classList.add("window-name-chromane-popup");
// }

import proxies from "chromane/shared/ts/proxies";
import config from "@shared/config";

import get_url from "@shared/get_url";

import PrjExtensionIframe from "../../../ts/PrjExtensionIframe";
let instance = new PrjExtensionIframe(config);

proxies.create_window_api(config.ext_id, instance, "*");
instance.init(get_url("firebase_iframe"));
