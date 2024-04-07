// import util from "chromane/shared/ts/util";
// import Popup from "@common/ui/popup/Popup";
// import { ContentLocation, ContentVideoDetectedData, DomainData, FBIframeInitData, Loop, LoopInput } from "@shared/types";

// export default class Content {
//   popup: Popup;
//   readonly domain_data: DomainData[];
//   active_domain_data: DomainData | null;
//   location_hostname: string;
//   location_url: string;
//   video_state: { index: number; video_el: HTMLVideoElement }[];
//   video_watch_tic: number;

//   constructor() {
//     this.video_state = [];
//     this.domain_data = [];
//     this.active_domain_data = null;
//     this.video_watch_tic = 0;
//   }

//   async init() {
//     //
//     this.location_hostname = location.hostname;
//     //

//     const item_current = this.domain_data.find((item) => this.location_hostname.endsWith(item.domain));
//     this.active_domain_data = item_current || null;

//     this.popup = new Popup();

//     await this.popup.init(util.get_url("extension_iframe"));

//     setTimeout(() => {
//       this.popup.iframe_wrap.exec("storage_set", { test: "test" });
//     }, 2000);
//   }

//   async get_init_data() {
//     if (location.href.startsWith("https://docs.google.com/document/d/")) {
//       let doc_name = document.querySelector(".docs-title-input")?.getAttribute("value");
//       let match = location.href.match(/\/document\/d\/([^\/]+)/);
//       let doc_id = match[1];
//       return {
//         type: "goole_doc",
//         doc_id,
//         doc_name,
//       };
//     } else {
//       return {
//         type: "normal_page",
//         page_html: document.documentElement.outerHTML,
//       };
//     }
//     // docs-title-input
//   }

//   get_page_html() {
//     return document.documentElement.outerHTML;
//   }

//   // todo: move this to config and handle a use case where these selectors are not found on the page
//   async set_value_for_items(items) {
//     for (let item of items) {
//       let [selector, value] = item;
//       this.set_value(selector, value);
//       await util.wait(10);
//     }
//   }

//   toggle() {
//     this.popup.toggle();
//   }
//   collection_manifest: any;
//   set_value(selector, value) {
//     let el: any = document.querySelector(selector);
//     el.value = value;
//     el.dispatchEvent(new Event("input", { bubbles: true }));
//     el.dispatchEvent(new Event("change", { bubbles: true }));
//   }

//   set_collection_manifest(collection_manifest) {
//     // console.log("collection_manifest", collection_manifest);
//     this.collection_manifest = collection_manifest;

//     if (collection_manifest.video_status) {
//       if (!this.active_domain_data) return;

//       setInterval(() => {}, 1000);
//     }
//   }
//   set_popup_progress_status(status) {
//     this.popup.set_progress_status(status);
//   }
//   //
//   set_range(range) {
//     range = parseInt(range);
//     let video = document.querySelector(`#shorts-container video.html5-main-video`) as HTMLVideoElement;
//     video.currentTime = video.duration * (range / 100);
//   }
//   forward_to_iframe(message) {
//     // console.log(message);
//     this.popup.iframe_wrap.exec("forward_in", message);
//   }
//   get_location_href() {
//     return location.href;
//   }
//   fetch_json(url, data) {
//     return util.fetch_json(url, data);
//   }
//   set_status(status) {
//     this.popup.set_status(status);
//   }
//   show_notification(data) {
//     return true;
//   }
//   async popup_hide() {
//     await this.popup.hide();
//   }
//   async popup_expand() {
//     // this.popup.expand();
//   }
//   async create_tab(url: string) {
//     chrome.runtime.sendMessage({ name: "create_tab", data: { url, active: true } });
//   }
// }
