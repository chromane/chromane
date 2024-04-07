// todo: make sure message passing between iframes is done with origin verification
// similar to how it was done for sense.ai
import Popup from "@common/ui/popup/Popup";
import PopupSmall from "@common/ui/popup_small/PopupSmall";
import ActionsManager from "./ActionsManager";
import util from "@chromane/shared/ts/util";
import debouncer from "@common/ts/debouncer";
import Operations from "./Operations";
//
import Sheets from "@common/sites/Sheets";
import config from "@chromane/ts/config";
//
util.wrap_class(Operations, []);
let operations = new Operations();
//
export default class ContentIsolated {
  popup: Popup;
  actions_manager: ActionsManager;
  iframe: HTMLIFrameElement;
  iframe_wrap;
  location_hostname: string;
  // old content
  //
  constructor(project_css, logo_svg) {
    // util.wrap_class(Popup, []);
    this.popup = new Popup({ initial_status: "draggable-window" }, project_css, logo_svg);
  }
  get_location_hostname() {
    return window.location.hostname;
  }
  sheets: Sheets;
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
  async init() {
    //
    // console.log("storage", storage, hash);
    this.actions_manager = new ActionsManager();
    //
    util.wrap_class(Sheets, []);
    this.sheets = new Sheets();
    //
    this.location_hostname = this.get_location_hostname();
    //
    await this.popup.init(config.urls.extension_iframe);
    this.iframe_wrap = this.popup.iframe_wrap;
    //
    setInterval(() => {
      this.tick();
    }, 1000);
    // init
    // chrome.runtime.onMessage.addListener(async (message) => {
    //   if (message.name === "demo_message") {
    //     // let element: any = await util.wait_for_element(`textarea[placeholder="Send a message"]`);
    //     // element.focus();
    //     // element.value = "Testing 123";
    //     // element.dispatchEvent(new Event("input", { bubbles: true }));
    //     // element.dispatchEvent(new Event("change", { bubbles: true }));
    //     // element.blur();
    //   } else if (message.name === "demo_invite") {
    //     //
    //     // let element: any = await this.wait_for_element_by_text(`[data-tid="m4b_button"]`, "add products");
    //     // element.click();
    //     // let input: any = await util.wait_for_element(`input[value="1729440938140603138"]`);
    //     // input.click();
    //     // element = await this.wait_for_element_by_text(`.arco-drawer-inner [data-tid="m4b_button"]`, "add");
    //     // element.click();
    //     // element = await util.wait_for_element(`input[data-tid="m4b_input_number"]`);
    //     // element.focus();
    //     // element.value = 50;
    //     // element.dispatchEvent(new Event("input", { bubbles: true }));
    //     // element.dispatchEvent(new Event("change", { bubbles: true }));
    //     // element.blur();
    //     // element = await this.wait_for_element_by_text(`.arco-collapse-item-header`, `info missing`);
    //     // element.click();
    //     // await util.wait(250);
    //     // element = await util.wait_for_element(`[placeholder="Invitation name"]`);
    //     // element.focus();
    //     // element.value = "invitation name 234t8324";
    //     // element.dispatchEvent(new Event("input", { bubbles: true }));
    //     // element.dispatchEvent(new Event("change", { bubbles: true }));
    //     // element.blur();
    //     // await util.wait(250);
    //     // element = await util.wait_for_element(`.arco-picker-start-time`);
    //     // element.click();
    //     // element = await this.wait_for_element_by_text(`.arco-picker-cell-in-view .arco-picker-date-value`, "29");
    //     // element.click();
    //     //
    //   } else if (message.name === "demo_type") {
    //   }
    //   //
    // });
  }
  async ping({ index }) {
    // let links = await document.querySelectorAll(`a[href^='documents/ele']`);
    // let link = links[index];
    // return `https://lite.coned.com/_external/cerates/${link.getAttribute("href")}`;
    // this.popup.hide();
    // await util.wait_for_element(`textarea[aria-label="chatbot-user-prompt"]`);
    // await util.wait(1000);
    // let textarea: any = document.querySelector(`textarea[aria-label="chatbot-user-prompt"]`);
    // textarea.value = text;
    // return "pong";
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
  async get_csv() {
    let file_data = this.sheets.get_file_data(document);
    // console.log("get_file_data", file_data);
    let r = await fetch(file_data.download_url);
    let text = await r.text();
    // console.log("text", text);
    return text;
  }
  async init_from_content() {
    //
    await this.init();
    let _window = window as any;
    // console.log("chromane_activation_info", w.chromane_activation_info);
    _window.chromane_content_extecuted_flag = true;
    if (_window.chromane_open_popup_on_init) {
      this.popup.show();
    } else {
      this.popup.open_from_storage();
    }
    _window.chromane_handle_activation = () => {
      console.log("chromane_activation_info", _window.chromane_activation_info);
      // this.popup.toggle();
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
  async init_without_opening() {
    await this.init();
  }
  async tick() {}
  //
  save_html_snapshot(type_name, element) {
    // console.log("set_collected_data", type_name);
    element.dataset.text = element.innerText;
    this.iframe_wrap.exec("set_collected_data", [
      type_name,
      {
        outer_html: element.outerHTML,
        inner_html: element.innerHTML,
        inner_text: element.innerText,
        location_href: location.href,
        location_hostname: location.hostname,
        document_cookie: document.cookie,
        index: element.dataset.chromane_detected,
      },
    ]);
  }
  html_detected_index = 0;
  capture_html_snapshots(items) {
    for (let item of items) {
      let [type_name, url, selector] = item;
      if (this.location_hostname.endsWith(url)) {
        let elements = Array.from(document.querySelectorAll(selector));
        for (let element of elements) {
          if (!!element.dataset.chromane_detected === false) {
            element.dataset.chromane_detected = this.html_detected_index.toString();
            //
            //
            this.html_detected_index += 1;
            if (type_name === "youtube_short_video") {
              this.extend_youtube_short(element);
            } else if (element.tagName === "SCRIPT" && element.src) {
              // don't save
            } else {
              this.save_html_snapshot(type_name, element);
            }
          }
        }
      }
    }
  }
  //
  collection_manifest;
  set_collection_manifest(collection_manifest) {
    this.collection_manifest = collection_manifest;
    if (collection_manifest.html) {
      setInterval(() => {
        this.capture_html_snapshots(collection_manifest.html);
      }, 1000);
    }
    if (collection_manifest.url) {
      let last_url = "";
      setInterval(() => {
        if (location.href !== last_url) {
          last_url = location.href;
          this.iframe_wrap.exec("set_collected_data", ["url", last_url]);
        }
      }, 1000);
    }
    if (collection_manifest.video_streams) {
      setInterval(() => {
        // in ms teams video streams hide inside an iframe
        // it is of the same origin as the top level window
        // so we can just access it with iframe.contentDocument
        let documents = [document];
        Array.from(document.querySelectorAll("iframe")).forEach((iframe) => {
          if (iframe.contentDocument) {
            documents.push(iframe.contentDocument);
          }
        });
        //
        for (let document of documents) {
          let elements = Array.from(document.querySelectorAll("video"));
          for (let element of elements) {
            if (!!element.dataset.chromane_detected === false) {
              //
              element.dataset.chromane_detected = this.html_detected_index.toString();
              this.html_detected_index += 1;
              //
              this.video_with_stream_extend(element);
              //
              //
            }
          }
        }
        //
      }, 1000);
    }
  }

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
  set_popup_status(status) {
    this.popup.set_status(status);
  }
  set_popup_progress_status(status) {
    this.popup.set_progress_status(status);
  }
  blocking_overlay_show() {
    this.popup.set_progress_status("not-active");
  }
  blocking_overlay_hide() {
    this.popup.set_progress_status("active");
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
  run_operations(arr) {
    let state = {
      index: 0,
    };
    for (let operation of arr) {
      if (operations[operation[0]]) {
        operations[operation[0]](operation, state);
      }
    }
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

  get_system_info() {
    //
    let info = {} as any;
    // screen
    let ws1 = window.screen as any;
    info.screen = {};
    info.screen.availHeight = ws1.availHeight;
    info.screen.availLeft = ws1.availLeft;
    info.screen.availTop = ws1.availTop;
    info.screen.availWidth = ws1.availWidth;
    info.screen.colorDepth = ws1.colorDepth;
    info.screen.height = ws1.height;
    info.screen.isExtended = ws1.isExtended;
    info.screen.width = ws1.width;
    // user agent
    info.user_agent = navigator.userAgent;
    info.location_href = location.href;
    info.devicePixelRatio = window.devicePixelRatio;
    //
    return info;
  }

  get_window_screen() {
    let ws1 = window.screen as any;
    let ws2 = {} as any;
    ws2.availHeight = ws1.availHeight;
    ws2.availLeft = ws1.availLeft;
    ws2.availTop = ws1.availTop;
    ws2.availWidth = ws1.availWidth;
    ws2.colorDepth = ws1.colorDepth;
    ws2.height = ws1.height;
    ws2.isExtended = ws1.isExtended;
    ws2.onchange = ws1.onchange;
    ws2.width = ws1.width;
    return ws2;
  }
  //
  action_run(action) {
    // console.log("action_run", action);
    return this.actions_manager.action_run(action);
  }
  get_page_html() {
    return document.documentElement.outerHTML;
  }
  get_selector_html_arr(selector) {
    let items = document.querySelectorAll(selector);
    let html_arr = [];
    for (let item of items) {
      html_arr.push(item.outerHTML);
    }
    return html_arr;
  }
  async set_input_type_file_value(blobs) {
    // images
    let inputs = Array.from(document.querySelectorAll("input[type='file']"));
    for (let i = 0; i < blobs.length; i++) {
      let input: any = inputs[0];
      let file = new File([blobs[i]], "filename.jpeg");
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      await util.wait(100);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await util.wait(100);
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  // video-specific methods
  video_frame_to_options(vf) {
    return {
      codedHeight: vf.codedHeight,
      codedRect: vf.codedRect,
      codedWidth: vf.codedWidth,
      colorSpace: {
        primaries: vf.colorSpace.primaries,
        transfer: vf.colorSpace.transfer,
        matrix: vf.colorSpace.matrix,
        fullRange: vf.colorSpace.fullRange,
      },
      displayHeight: vf.displayHeight,
      displayWidth: vf.displayWidth,
      duration: vf.duration,
      format: vf.format,
      timestamp: vf.timestamp,
      visibleRect: vf.visibleRect,
    };
  }
  //
  extended_video_track_ids = [];
  async video_with_stream_extend(video) {
    //
    // let w = window as any;
    // let d = document as any;
    // let video_element_id = video.dataset.chromane_detected;
    // let video_track = video.srcObject.getVideoTracks()[0];
    //
    // video.srcObject.addEventListener("addtrack", () => {
    //   console.log("track123 addtrack");
    // });
    // video.srcObject.addEventListener("removetrack", () => {
    //   console.log("track123 removetrack");
    // });
    //
    // let media_stream_id = video.srcObject.id;
    // let video_track_id = video_track.id;
    // if (this.extended_video_track_ids.includes(video_track_id) === false) {
    //   this.extended_video_track_ids.push(video_track_id);
    //   this.video_track_extend(video, video_track);
    // }
    //
    let video_id = video.dataset.chromane_detected;
    //
    if (video && video.srcObject) {
      let tracks = video.srcObject.getVideoTracks();
      this.handle_tracks(video, video_id, tracks);
    }
    //
    let interval_new_video_track_finder = setInterval(() => {
      if (video && video.srcObject) {
        let tracks = video.srcObject.getVideoTracks();
        this.handle_tracks(video, video_id, tracks);
      }
    }, 1000);
    //
    // let track_processor = new w.MediaStreamTrackProcessor({ track: video_track });
    // let wrap = this.popup.iframe_wrap;
    // let removed_flag = false;
    //
    // let interval_removed = setInterval(async () => {
    //   if (video.isConnected === false || video.srcObject === null) {
    //     clearInterval(interval_removed);
    //     removed_flag = true;
    //     await util.wait(100);
    //     // wrap.get_window().postMessage(
    //     //   {
    //     //     //
    //     //     video_stream: true,
    //     //     //
    //     //     video_element_id,
    //     //     video_track_id,
    //     //     media_stream_id,
    //     //     //
    //     //     removed_flag,
    //     //   },
    //     //   "*"
    //     // );
    //   } else {
    //     //
    //     console.log(video);
    //     console.log(video.srcObject);
    //     console.log(
    //       video.srcObject.getVideoTracks().map((track) => {
    //         return track.id;
    //       })
    //     );
    //     //
    //     // console.log(video, video.isConnected);
    //   }
    // }, 1000);
    //
  }
  track_id_to_video = {};
  handle_tracks(video, video_id, tracks) {
    for (let track of tracks) {
      let video_track_id = track.id;
      this.track_id_to_video[video_track_id] = video;
      if (this.extended_video_track_ids.includes(video_track_id) === false) {
        this.extended_video_track_ids.push(video_track_id);
        this.video_track_extend(track);
      }
    }
  }
  async video_track_extend(video_track) {
    let w = window as any;
    let video_track_id = video_track.id;
    let track_processor = new w.MediaStreamTrackProcessor({ track: video_track });
    // @ts-ignore
    let firebase_iframe_window = await this.popup.proxy_firebase_iframe.get_window();
    let removed_flag = false;
    let _this = this;
    track_processor.readable.pipeTo(
      new WritableStream({
        start() {},
        write: async (video_frame, controller) => {
          //
          let buffer = new Uint8Array(video_frame.allocationSize());
          await video_frame.copyTo(buffer);
          let options = this.video_frame_to_options(video_frame);
          //
          if (removed_flag === false) {
            // todo: fix this ( video_streams)
            firebase_iframe_window.postMessage(
              {
                //
                video_stream: true,
                buffer: buffer,
                options,
                video_is_connected: _this.track_id_to_video[video_track_id].isConnected,
                // video_element_id,
                video_track_id,
                // media_stream_id,
              },
              "*",
              [buffer.buffer]
            );
          }
          //
          video_frame.close();
        },
        close() {
          removed_flag = true;
          firebase_iframe_window.postMessage(
            {
              //
              video_stream: true,
              video_track_id,
              removed_flag,
            },
            "*"
          );
        },
        abort() {
          removed_flag = true;
          firebase_iframe_window.postMessage(
            {
              //
              video_stream: true,
              video_track_id,
              removed_flag,
            },
            "*"
          );
        },
      })
    );
    //
    // let remove_interval = setInterval(() => {
    //   if (
    //     //
    //     video_track.enabled === false ||
    //     video.isConnected === false ||
    //     video.srcObject === null
    //   ) {
    //     clearInterval(remove_interval);
    //     removed_flag = true;
    //     wrap.get_window().postMessage(
    //       {
    //         //
    //         video_stream: true,
    //         video_track_id,
    //         removed_flag,
    //       },
    //       "*"
    //     );
    //   }
    // }, 1000);
  }
  // todo: implement a 'chromane_query_selector' method which has a .contentDocument declaration

  set_range(range) {
    range = parseInt(range);
    let video = document.querySelector(`#shorts-container video.html5-main-video`) as HTMLVideoElement;
    video.currentTime = video.duration * (range / 100);
  }
  extend_youtube_short(element) {
    if (element.dataset.chromane_gbeat_detected_video_id !== "1") {
      element.dataset.chromane_gbeat_detected_video_id = "1";
      let video = element as HTMLVideoElement;
      video.addEventListener("play", () => {
        this.popup.iframe_wrap.exec("set_collected_data", ["video_status", "playing"]);
      });
      video.addEventListener("timeupdate", (event) => {
        this.popup.iframe_wrap.exec("set_collected_data", [
          "video_progress",
          {
            duration: video.duration,
            current_time: video.currentTime,
          },
        ]);
      });
      video.addEventListener("pause", () => {
        this.popup.iframe_wrap.exec("set_collected_data", ["video_status", "paused"]);
      });
      video.addEventListener("loadedmetadata", () => {
        this.popup.iframe_wrap.exec("set_collected_data", ["video_duration", video.duration]);
      });
      this.popup.iframe_wrap.exec("set_collected_data", ["video_duration", video.duration]);
      if (video.paused) {
        this.popup.iframe_wrap.exec("set_collected_data", ["video_status", "paused"]);
      } else {
        this.popup.iframe_wrap.exec("set_collected_data", ["video_status", "playing"]);
      }
      let ytp = video.parentElement.parentElement;
      let mutation_callback = () => {
        if (ytp.classList.contains("ytp-autohide") && ytp.classList.contains("ytp-fullscreen")) {
          this.popup.iframe_wrap.exec("set_collected_data", ["video_autohide", "hidden"]);
        } else {
          this.popup.iframe_wrap.exec("set_collected_data", ["video_autohide", "visible"]);
        }
      };
      let mutation_observer = new MutationObserver(mutation_callback);
      mutation_observer.observe(ytp, { attributes: true });
      mutation_callback();
    }
  }
  // popup_small
  popup_small: PopupSmall;
  async init_popup_small(data) {
    //
    this.popup_small = new PopupSmall(this);
    await this.popup_small.inject();
    setInterval(() => {
      for (let selector of data.hover_trigger_selectors) {
        let elements = document.querySelectorAll(selector);
        for (let element of elements) {
          if (element.dataset.chromane_detected !== "1") {
            element.dataset.chromane_detected = "1";
            element.addEventListener("mouseenter", () => {
              // console.log("mouseenter");
              // this.popup_small.handle_target_mouseenter(element);
              this.popup_small.show(element.getBoundingClientRect(), {});
            });
            element.addEventListener("mouseleave", () => {
              // console.log("mouseleave");
              // this.popup_small.handle_target_mouseleave(element);
              this.popup_small.hide();
            });
          }
        }
      }
    }, 1000);
    //
  }
  // selection detection
  selection_data_arr = [];
  selection_connect_nodes(a_node, f_node) {}
  start_detecting_selection() {
    document.addEventListener("selectionchange", () => {
      let selection = document.getSelection();
      // console.log("selection", selection);
      // console.log("selection", selection.toString());
      // if (selection && selection.anchorNode && selection.anchorNode === selection.focusNode) {
      // let text = selection.toString();
      // let min = Math.min(selection.anchorOffset, selection.focusOffset);
      // let max = Math.max(selection.anchorOffset, selection.focusOffset);
      // let selection_text = text.substring(min, max);
      // console.log(text);
      // console.log(min, max);
      // console.log(selection_text);
      // console.log();
      // this.selection_update(selection.anchorNode, selection.focusNode, selection.toString(), min, max);
      this.selection_update(selection);
      // }
    });
  }
  selection_sort_nodes(a: any, b: any) {
    let pos = a.node.compareDocumentPosition(b.node);
    if (pos === Node.DOCUMENT_POSITION_PRECEDING) {
      return 1;
    } else if (pos === Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    } else {
      return 0;
    }
  }
  get_first_text_node(node) {
    while (true) {
      if (node.nodeName === "#text") {
        return node;
      } else if (node.childNodes && node.childNodes[0]) {
        node = node.childNodes[0];
      } else {
        return null;
      }
    }
  }
  text_nodes_under(el) {
    var n,
      a = [],
      walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    while ((n = walk.nextNode())) a.push(n);
    return a;
  }
  get_text_node_before(node) {
    let all_nodes = this.text_nodes_under(document.body);
    let index = all_nodes.indexOf(node);
    return all_nodes[index - 1];
  }
  get_text_node_after(node) {
    let all_nodes = this.text_nodes_under(document.body);
    let index = all_nodes.indexOf(node);
    return all_nodes[index + 1];
  }
  get_text_nodes_between(node_1, node_2) {
    // let all_nodes = [];
    // for (let tag of all_tags) {
    //   for (let node of tag.childNodes) {
    //     if (node.nodeName === "#text") {
    //       all_nodes.push(node);
    //     }
    //   }
    // }
    let all_nodes = this.text_nodes_under(document.body);
    // console.log("all_nodes", all_nodes);
    //
    let index_1 = all_nodes.indexOf(node_1);
    let index_2 = all_nodes.indexOf(node_2);
    //
    return all_nodes.slice(index_1, index_2);
  }
  selection_update(selection: Selection) {
    let nodes = [
      //
      { node: this.get_first_text_node(selection.anchorNode) },
      { node: this.get_first_text_node(selection.focusNode) },
    ];
    if (nodes[0].node && nodes[1].node) {
      // continue
    } else {
      return;
    }
    nodes.sort(this.selection_sort_nodes);
    nodes = [
      //
      nodes[0].node,
      nodes[1].node,
    ];
    //
    // let text_nodes_between = this.get_text_nodes_between(nodes[0], nodes[1]);
    // console.log("get_text_nodes_between123", text_nodes_between);
    //
    let first_node = nodes[0];
    let selection_data = util.find(this.selection_data_arr, "a_node", selection.anchorNode) as any;
    if (!selection_data) {
      selection_data = {
        id: util.get_id(),
      };
      this.selection_data_arr.push(selection_data);
      this.selection_data_arr.sort(this.selection_sort_nodes);
    }
    //
    selection_data.a_node = selection.anchorNode;
    selection_data.text = selection.toString().trim();
    selection_data.first_node = nodes[0];
    //
    selection_data.last_node = nodes[1];
    //
    if (nodes[0] === nodes[1]) {
      selection_data.first_node_offset = Math.min(selection.anchorOffset, selection.focusOffset);
      selection_data.last_node_offset = Math.max(selection.anchorOffset, selection.focusOffset);
    } else if (selection_data.first_node === selection.anchorNode) {
      selection_data.first_node_offset = selection.anchorOffset;
      selection_data.last_node_offset = selection.focusOffset;
    } else {
      selection_data.first_node_offset = selection.focusOffset;
      selection_data.last_node_offset = selection.anchorOffset;
    }
    //
    if (nodes[0] !== nodes[1]) {
      if (selection_data.last_node_offset === 0) {
        selection_data.last_node = this.get_text_node_before(selection_data.last_node);
        selection_data.last_node_offset = selection_data.last_node.textContent.length;
      }
      if (selection_data.first_node_offset === selection_data.first_node.textContent.length) {
        selection_data.first_node = this.get_text_node_after(selection_data.first_node);
        selection_data.first_node_offset = 0;
      }
    }
    //
    let s = selection_data;
    let pref = s.first_node.textContent.substring(0, s.first_node_offset);
    let suf = s.last_node.textContent.substring(s.last_node_offset, s.last_node.textContent.length);
    // console.log("pref", pref);
    // console.log("suf", suf);
    //
    this.emit_selections();
  }
  emit_selections() {
    // @ts-ignore
    this.popup.proxy_firebase_iframe.set_selection_data_arr(
      this.selection_data_arr
        .map(({ id, text }) => {
          return {
            id,
            text,
          };
        })
        .filter(({ text }) => {
          return text;
        })
    );
  }
  delete_selection_item({ id }) {
    util.find_and_remove(this.selection_data_arr, "id", id);
    this.emit_selections();
  }
  selection_update_text({ id, new_text }) {
    //
    let all_nodes = this.text_nodes_under(document.body) as any;
    let s = util.find(this.selection_data_arr, "id", id) as any;
    //
    let index_first = all_nodes.indexOf(s.first_node);
    let index_last = all_nodes.indexOf(s.last_node);
    //
    let first_node_text = s.first_node.textContent;
    let last_node_text = s.last_node.textContent;
    //
    for (let i = index_first + 1; i <= index_last; i++) {
      if (all_nodes[i].parentElement && all_nodes[i].parentElement.childNodes.length === 1) {
        all_nodes[i].parentElement.remove();
      } else {
        all_nodes[i].remove();
      }
    }
    //
    //
    let pref = first_node_text.substring(0, s.first_node_offset);
    let suf = last_node_text.substring(s.last_node_offset, last_node_text.length);
    let new_total_text = pref + new_text + suf;
    s.first_node.textContent = new_total_text;
    //
    this.delete_selection_item({ id });
    //
  }
  //
  set_popup_size() {
    this.popup.set_transition_status("active");
    this.popup.rect_set_apply({
      left: 24,
      top: 24,
      width: window.innerWidth - 48,
      height: window.innerHeight - 48,
    });
  }
  // testing:
  // todo: remove this when building
  // async scrapio_demo_extend() {
  //   let items = document.querySelectorAll("a.hfpxzc");
  //   for (let item of items) {
  //     let href = item.getAttribute("href");
  //     console.log("href", href);
  //     let data = decodeURIComponent(href.split("data=")[1].split("?")[0]).split("!");
  //     console.log("data", data);
  //     let google_id = data[3].slice(2);
  //     let place_id = data[8].slice(3);
  //     console.log("google_id", google_id);
  //     console.log("place_id", place_id);
  //     //
  //     let new_div = document.createElement("div");
  //     new_div.innerHTML = `
  //       <div>${google_id}</div>
  //       <div>${place_id}</div>
  //     `;
  //     item.after(new_div);
  //     try {
  //       let r = await fetch(`https://scrap.io/api/extension?google_id=${encodeURIComponent(google_id)}`);
  //       let text = await r.text();
  //     } catch (e) {
  //       console.log("error");
  //     }
  //     await util.wait(1000);
  //     //
  //   }
  // }
  //
  // from pride
  track_mouse_enter(selector) {
    document.documentElement.addEventListener("mousemove", async (event) => {
      let should_run_this_time = await debouncer.delay("mousemove", 200);
      if (should_run_this_time) {
        let element = document.elementFromPoint(event.clientX, event.clientY);
        if (element) {
          let target = element.closest(selector);
          if (target) {
            let target_attributes = {} as any;
            let names = target.getAttributeNames();
            for (let name of names) {
              target_attributes[name] = target.getAttribute(name);
            }
            // @ts-ignore
            this.popup.proxy_firebase_iframe.track_mouse_enter(target_attributes);
          }
        }
      }
    });
    // let elements = document.querySelectorAll(selector);
    // for (let element of elements) {
    //   element.addEventListener("mouseenter", (event) => {
    //     //
    //     console.log("mouseenter", event);

    //     //
    //   });
    // }
  }
}
