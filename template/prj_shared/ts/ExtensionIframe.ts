import util from "chromane/shared/ts/util";
import config from "@shared/config";
import versions from "@shared/versions.json";
import { GetScreenshotTaintedArg, VideoScreenFromExtIframeResponse } from "@shared/types";

export default class ExtensionIframe {
  iframe_wrap;
  video_load_state: {
    [key: string]: { is_pending: boolean; outer_data: GetScreenshotTaintedArg };
  };
  //
  async init(page_name) {
    this.video_load_state = {};
    //
    await util.wait(10);
    let storage = await util.storage_get(["version_frontend"]);

    if (storage.version_frontend) {
      this.inject_iframe(page_name, storage.version_frontend);
      let version_frontend_new = await this.fetch_version_frontend();
      if (storage.version_frontend !== version_frontend_new) {
        this.remove_iframe();
        this.inject_iframe(page_name, version_frontend_new);
        util.storage_set({ version_frontend: version_frontend_new });
      }
    } else {
      let version_frontend_new = await this.fetch_version_frontend();
      this.inject_iframe(page_name, version_frontend_new);
      util.storage_set({ version_frontend: version_frontend_new });
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
    let r = await fetch(config.versions_root + "/v/" + versions.extension + ".txt" + "?ts=" + Date.now());
    let text = await r.text();
    console.log("version_text", text);
    return text;
  }
  remove_iframe() {
    document.querySelector("iframe")?.remove();
  }
  inject_iframe(page_name, version_frontend) {
    let iframe = document.createElement("iframe");
    const name_data = {
      parent: "extension",
    };
    iframe.name = JSON.stringify(name_data);
    iframe.setAttribute("allow", "camera; microphone; fullscreen; display-capture; clipboard-read; clipboard-write");
    this.iframe_wrap = util.create_iframe_wrap_from_name("firebase_iframe");
    iframe.src = util.get_url(page_name, version_frontend);
    document.body.appendChild(iframe);
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
  tabs_reload() {
    return chrome.tabs.reload();
  }
  tabs_create(data) {
    return chrome.tabs.create(data);
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
  window_close(data) {
    window.close();
  }
  fetch_json([url, data]) {
    return util.fetch_json(url, data);
  }
  get_extension_id() {
    return chrome.runtime.id;
  }
  async get_tab_id() {
    let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0].id;
  }
}
