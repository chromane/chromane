let _window: any = window;
_window.chrome = {
  storage: {
    local: {
      set() {},
      get() {
        return {};
      },
    },
  },
};

import proxies from "@chromane/shared/ts/proxies";
import config from "@shared/config";

import PrjExtensionIframe from "@root/prj_ext/ts/PrjExtensionIframe";
let instance = new PrjExtensionIframe(config);

proxies.create_window_api(config.ext_id, instance, "*");
instance.init(config.urls.firebase_iframe);
