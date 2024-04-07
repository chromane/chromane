// todo: add icons in different sizes:
// "128": "icons/logo-128.png",
// "16": "icons/logo-16.png",
// "48": "icons/logo-48.png"

import proxies from "@chromane/shared/ts/proxies";
import util from "@chromane/shared/ts/util";
import type CloudIframe from "@chromane/front/ts/CloudIframe";
import type { ExtensionConfig } from "@chromane/shared/types/types";

export default class ExtensionIframe {
  proxy_firebase_iframe: CloudIframe;
  config: ExtensionConfig;
  constructor(config: ExtensionConfig) {
    this.config = config;
    this.proxy_firebase_iframe = proxies.create_proxy_from_iframe_name<CloudIframe>(config.extension_id, "firebase_iframe");
  }
  async init(base_url) {
    //
    await util.wait(10);
    let storage = (await util.storage_get(["version_frontend"])) as any;
    if (storage.version_frontend) {
      this.inject_iframe(base_url, storage.version_frontend);
      let version_frontend_new = await this.fetch_version_frontend();
      if (storage.version_frontend !== version_frontend_new) {
        this.remove_iframe();
        this.inject_iframe(base_url, version_frontend_new);
        util.storage_set({ version_frontend: version_frontend_new });
      }
    } else {
      let version_frontend_new = await this.fetch_version_frontend();
      this.inject_iframe(base_url, version_frontend_new);
      util.storage_set({ version_frontend: version_frontend_new });
    }
    //
    if (this.config.mode === "dev" || this.config.mode === "prod") {
      chrome.runtime.onMessage.addListener((message) => {
        this.proxy_firebase_iframe.handle_runtime_message(message);
      });
      chrome.permissions.onAdded.addListener(async () => {
        let permissions = await chrome.permissions.getAll();
        this.proxy_firebase_iframe.handle_permissions_change(permissions);
      });
      chrome.permissions.onRemoved.addListener(async () => {
        let permissions = await chrome.permissions.getAll();
        this.proxy_firebase_iframe.handle_permissions_change(permissions);
      });
    }
    //
    // chrome.runtime.onMessage.addListener((message) => {
    //   if (message.name === "extension_redirect") {
    //     this.iframe_wrap.exec("extension_redirect", message.data);
    //   }
    // });
    //
  }
  async fetch_version_frontend() {
    //
    if (this.config.mode === "prod") {
      let ext_version = chrome.runtime.getManifest().version;
      let response = await fetch(this.config.urls.hosting + "/v/" + ext_version + ".txt" + "?ts=" + Date.now())
        .then((r: Response) => {
          return r.text();
        })
        .catch((e: Error) => {
          console.log("err", e);
          return e.message;
        });
      console.log("version_text", response);
      return response;
    } else {
      return "";
    }
  }
  remove_iframe() {
    document.querySelector("iframe").remove();
  }
  inject_iframe(base_url, version_frontend) {
    let iframe = document.createElement("iframe");
    if (window.name === "chromane-popup") {
      iframe.name = "chromane-popup";
    }
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("allow", "camera; microphone; fullscreen; display-capture; clipboard-read; clipboard-write");
    iframe.src = util.get_url(base_url, version_frontend);
    document.body.appendChild(iframe);
  }
  //
  blocking_overlay_show() {
    document.querySelector("#blocking-overlay").classList.add("visible");
  }
  blocking_overlay_hide() {
    document.querySelector("#blocking-overlay").classList.remove("visible");
  }
  // permissions
  get_permissions() {
    console.log(this.config.mode);
    if (this.config.mode === "test") {
      return {};
    } else {
      return chrome.permissions.getAll();
    }
  }
  // tab exec forwarding
  tab_exec([tab_id, name, data]) {
    return util.tab_exec(tab_id, name, data);
  }
  // content scripts
  async register_content_scripts([ids, scripts]) {
    try {
      await chrome.scripting.unregisterContentScripts({ ids });
    } catch (e) {
      console.log("err", e);
    }
    chrome.scripting.registerContentScripts(scripts);
  }
  async unregister_content_scripts(ids) {
    try {
      await chrome.scripting.unregisterContentScripts({ ids });
    } catch (e) {
      console.log("err", e);
    }
  }
  async execute_script(files) {
    let tab_id = await this.get_tab_id();
    let result = await chrome.scripting.executeScript({
      target: { tabId: tab_id },
      files,
    });
    return result;
  }
  async get_registered_content_scripts() {
    return await chrome.scripting.getRegisteredContentScripts();
  }
  // default
  storage_set(data) {
    return util.storage_set(data);
  }
  storage_get(data) {
    return util.storage_get(data);
  }
  storage_clear() {
    return chrome.storage.local.clear();
  }
  tabs_remove(id) {
    chrome.tabs.remove(id);
  }
  tabs_reload() {
    return chrome.tabs.reload();
  }
  capture_visible_tab(options) {
    return chrome.tabs.captureVisibleTab(options);
  }
  // legacy
  take_screenshot() {
    return chrome.tabs.captureVisibleTab(null, { format: "png" });
  }
  tabs_create(data) {
    return chrome.tabs.create(data);
  }
  tabs_update([id, data]) {
    return chrome.tabs.update(id, data);
  }
  tabs_create_extension(data) {
    data.url = chrome.runtime.getURL(data.url);
    return chrome.tabs.create(data);
  }
  windows_create(data) {
    return chrome.windows.create(data);
  }
  tabs_query(data) {
    return chrome.tabs.query(data);
  }
  window_close() {
    window.close();
  }
  fetch_text([url, data]) {
    return util.fetch_text(url, data);
  }
  fetch_json([url, data]) {
    return util.fetch_json(url, data);
  }
  fetch_blob([url, data]) {
    return util.fetch_blob(url, data);
  }
  async fetch_with_form_data([url, data, fields]) {
    let form_data = new FormData();
    Object.keys(fields).forEach((key) => {
      form_data.append(key, fields[key]);
    });
    data.body = form_data;
    let r = await fetch(url, data);
    let text = await r.text();
    return text;
  }
  get_extension_id() {
    return chrome.runtime.id;
  }
  get_location_href() {
    return location.href;
  }
  async get_tab_id() {
    let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0].id;
  }
  send_runtime_message(message) {
    chrome.runtime.sendMessage(message);
  }
  tabs_get(tab_id) {
    return chrome.tabs.get(tab_id);
  }
  // tab messaging
  async send_tab_message(tab_id, message) {
    return await chrome.tabs.sendMessage(tab_id, message);
  }
}
