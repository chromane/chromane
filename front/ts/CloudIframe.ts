import type ExtensionIframe from "@chromane/ext/ts/ExtensionIframe";
import type ContentBasic from "@chromane/ext/ts/ContentBasic";
import type ExtensionBack from "@chromane/back/ts/ExtensionBack";

import util from "@chromane/shared/ts/util";
import proxies from "@chromane/shared/ts/proxies";
import FirebaseManager from "@chromane/front/ts/FirebaseManager";
import { get_id } from "@chromane/shared/ts/helpers";

export default class CloudIframe {
  ext_store: any;
  proxy_content: ContentBasic;
  proxy_extension_iframe: ExtensionIframe;
  firebase_manager: FirebaseManager;
  backend_module: ExtensionBack;
  a = { b: { c: {} } };
  window_name = "";
  iframe_id = "";
  c: ContentBasic;
  constructor(ext_store, ext_config) {
    this.iframe_id = get_id();
    this.window_name = window.name;
    this.ext_store = ext_store;
    this.proxy_content = proxies.create_window_proxy<ContentBasic>(ext_config.ext_id, window, window.parent.parent);
    this.proxy_extension_iframe = proxies.create_window_proxy<ExtensionIframe>(ext_config.ext_id, window, window.parent);
    this.firebase_manager = new FirebaseManager(this, ext_config, ext_store, ext_config);
  }
  drawer_item_click(item) {
    this.ext_store.active_page_comp_name = item.comp_name;
  }
  arrow_button_click() {}
  close_button_click() {}
  blocking_inc() {
    this.ext_store.ui_number_of_blocking_operations += 1;
  }
  blocking_dec() {
    this.ext_store.ui_number_of_blocking_operations -= 1;
  }
  after_successfully_auth() {}
  goto(page_name) {}
  handle_runtime_message(message) {}
  handle_permissions_change(permissions) {}
  set_popup_status(new_popup_status) {}
  handle_activation_info(info) {}
}
