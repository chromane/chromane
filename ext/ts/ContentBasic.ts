// todo: make sure message passing between iframes is done with origin verification
// similar to how it was done for sense.ai
import Popup from "./popup/Popup";
import util from "@chromane/shared/ts/util";
import proxies from "@chromane/shared/ts/proxies";
// import CloudIframe from "@chromane/front/ts/CloudIframe";
import type CloudIframe from "../../front/ts/CloudIframe";
import { ExtensionConfig } from "@chromane/shared/types/types";
//
//
export default class ContentBasic {
  popup: Popup;
  iframe: HTMLIFrameElement;
  iframe_wrap;
  location_hostname: string;
  // old content
  //
  proxy_cloud_iframe: CloudIframe;
  config: ExtensionConfig;
  constructor(config: ExtensionConfig, project_css, logo_svg) {
    // util.wrap_class(Popup, []);
    // this.proxy_cloud_iframe = new CloudIframe("", "");
    this.config = config;
    this.proxy_cloud_iframe = proxies.create_proxy_from_iframe_name<CloudIframe>(this.config.ext_id, "firebase_iframe");
    this.popup = new Popup(this, { initial_status: "draggable-window" }, project_css, logo_svg);
  }
  get_location_hostname() {
    return window.location.hostname;
  }
  async sv2(element, value) {
    await util.wait(100);
    element.focus();
    await util.wait(100);
    element.value = value;
    // event
    let event;
    // focus
    event = new Event("focus", { bubbles: true });
    event.simulated = true;
    element.dispatchEvent(event);
    await util.wait(100);
    // input
    event = new Event("input", { bubbles: true });
    event.simulated = true;
    element.dispatchEvent(event);
    await util.wait(100);
    // change
    event = new Event("change", { bubbles: true });
    event.simulated = true;
    element.dispatchEvent(event);
    await util.wait(100);
  }
  async wait_for_same_text(element) {
    let text = "";
    while (true) {
      await util.wait(1000);
      if (text === element.textContent) {
        return element.textContent;
      } else {
        text = element.textContent;
      }
    }
  }

  async wait_for_element_by_text(selector, text) {
    text = text.trim().toLowerCase();
    while (true) {
      let elements = document.querySelectorAll(selector);
      for (let element of elements) {
        if (element) {
          if (element.textContent.trim().toLowerCase().includes(text)) {
            return element;
          }
        }
      }
      await util.wait(100);
    }
  }

  async init(extension_iframe_url) {
    //
    this.location_hostname = this.get_location_hostname();
    //
    await this.popup.init(extension_iframe_url);
    this.iframe_wrap = this.popup.iframe_wrap;
    //
    setInterval(() => {
      this.tick();
    }, 1000);
    //
    let _window = window as any;
    // console.log("chromane_activation_info", w.chromane_activation_info);
    _window.chromane_content_extecuted_flag = true;
    if (_window.location.href === `chrome-extension://${this.config.ext_id}/pages/onboarding/index.html`) {
      this.popup.storage_enabled = false;
      this.popup.set_status("onboarding_popup");
      chrome.runtime.onMessage.addListener((message) => {
        if (message.name === "handle_action_click") {
          this.popup.toggle();
        }
      });
    } else if (_window.location.href === `chrome-extension://${this.config.ext_id}/pages/blank/index.html`) {
      this.popup.show();
    } else if (_window.chromane_open_popup_on_init) {
      this.popup.show();
    } else {
      this.popup.open_from_storage();
    }
    this.proxy_cloud_iframe.handle_activation_info(_window.chromane_activation_info);
    _window.chromane_handle_activation = () => {
      if (this.popup.status === "hidden") {
        this.popup.toggle();
      }
      console.log("chromane_activation_info", _window.chromane_activation_info);
      this.proxy_cloud_iframe.handle_activation_info(_window.chromane_activation_info);
    };
    _window.chromane_handle_action_click = () => {
      this.popup.toggle();
      console.log("chromane_activation_info", _window.chromane_activation_info);
      this.proxy_cloud_iframe.handle_activation_info(_window.chromane_activation_info);
    };
    //
  }
  get_content_data() {
    let w = window as any;
    let activation_info = w.chromane_activation_info;
    let opened_from_action_flag = w.chromane_open_popup_on_init;
    let location_href = location.href;
    let url = new URL(location_href);
    let origin = url.origin;
    return {
      opened_from_action_flag,
      activation_info,
      location_href,
      origin,
    };
  }
  async tick() {}
  //

  html_detected_index = 0;

  //
  collection_manifest;

  //
  fetch_json([url, data]) {
    return util.fetch_json(url, data);
  }
  fetch_text([url, data]) {
    return util.fetch_text(url, data);
  }
  fetch_blob([url, data]) {
    return util.fetch_blob(url, data);
  }
  // window api
  set_popup_status(status, info?) {
    this.popup.set_status(status, info);
  }
  set_popup_progress_status(status) {
    console.log("set_popup_progress_status");
    this.popup.set_progress_status(status);
  }
  blocking_overlay_show() {
    this.popup.set_progress_status("active");
  }
  blocking_overlay_hide() {
    this.popup.set_progress_status("not-active");
  }
  set_popup_sidebar_mode(mode) {
    this.popup.set_sidebar_mode(mode);
  }
  toggle_iframe() {
    this.popup.toggle();
  }
  open_iframe() {
    this.popup.show();
  }
  popup_hide() {
    this.popup.hide();
  }
  popup_show() {
    this.popup.show();
  }

  set_iframe_size(data) {
    // $("#chromane_iframe_container").removeClass("chromane-wide");
    // $("#chromane_iframe_container").removeClass("chromane-normal");
    if (data.size === "wide") {
      this.popup.set_sidebar_wide();
    } else if (data.size === "normal") {
      this.popup.set_sidebar_normal();
    }
  }
  //
  find_by_text(root, selector, text) {
    let items = root.querySelectorAll(selector);
    for (let item of items) {
      if (item.textContent.trim().toLowerCase() === text) {
        return item;
      }
    }
  }
  set_value_by_text(selector, text, value) {
    if (value) {
      let element = this.find_by_text(document, selector, text);
      if (element) {
        element.focus();
        element.value = value;
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
        element.blur();
      }
    }
  }
  set_value(selector, value) {
    if (value) {
      let element = document.querySelector(selector);
      if (element) {
        element.focus();
        element.value = value;
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
        element.blur();
      }
    }
  }

  get_location_href() {
    return location.href;
  }

  get_page_html() {
    return document.documentElement.outerHTML;
  }
  get_selector_html_arr(selector) {
    let items = document.querySelectorAll(selector);
    let html_arr = [];
    for (let item of items) {
      // @ts-ignore
      html_arr.push(item.outerHTML);
    }
    return html_arr;
  }
  set_popup_size() {
    this.popup.set_transition_status("active");
    this.popup.rect_set_apply({
      left: 24,
      top: 24,
      width: window.innerWidth - 48,
      height: window.innerHeight - 48,
    });
  }
  set_popup_position(left, top) {
    this.popup.set_position(left, top);
  }
}
