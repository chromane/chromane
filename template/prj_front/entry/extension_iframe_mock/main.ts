import chrome_mock from "@chromane/front/ts/chrome_mock";
chrome_mock.init(window);

import config from "@shared/config";
config.mode = "sandbox";

import get_url from "@shared/get_url";

import proxies from "@chromane/shared/ts/proxies";

import PrjExtensionIframe from "@root/prj_ext/ts/PrjExtensionIframe";
let instance = new PrjExtensionIframe(config);

proxies.create_window_api(config.ext_id, instance, "*");
instance.init(get_url("firebase_iframe"));
