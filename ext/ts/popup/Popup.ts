// todo: bugfix: sometimes popup covers other components
// todo: feature: update popup on window resize
import util from "../../../shared/ts/util";
import popup_html from "./popup.html?raw";
import popup_css from "./popup.css?raw";
import logo_progress_svg from "../../svg/ripple.svg?raw";
import ContentBasic from "../ContentBasic";
// import { ExtensionIframeInteraface, FirebaseIframeInterface } from "@common/types/types";
function distance(dx, dy) {
  return Math.sqrt(dx * dx + dy * dy);
}
// todo: presist popup location in between page reloads
// todo: at at least one automated end-to-end test for each tool
// todo: bugfix: set popup state to bubble, then reload the page
// todo: upate the color scheme everywhere to dark-green
// todo: bugfix: storing popup state when it becomes a sidebar causes inability to resize after page reload
// todo: move this inside of shadow root
// todo: update popup position on window resize
// todo: handle use case: two different chromane extensions in the same page
// todo: chevron quickly changes direction after changing status from sidebar-right/sidebar-left to draggable-window
enum TransitionStatus {
  active = "active",
  not_active = "not-active",
}
enum ProgressStatus {
  active = "active",
  not_active = "not-active",
}
enum PopupStatus {
  hidden = "hidden",
  showing = "showing",
  hiding = "hiding",
  bubble = "bubble",
  button = "button",
  draggable_window = "draggable-window",
  draggable_overlay = "draggable-overlay",
  solid_popup = "solid-popup",
  sidebar_left = "sidebar-left",
  sidebar_left_hidden = "sidebar-left-hidden",
  sidebar_right = "sidebar-right",
  sidebar_right_hidden = "sidebar-right-hidden",
}
enum ContainerMode {
  bubble = "bubble",
  popup = "popup",
  sidebar = "sidebar",
}
//
export default class Popup {
  //
  overlay: HTMLElement | null = null;
  popup: HTMLElement | null = null;
  popup_iframe: HTMLElement | null = null;
  button_left: number | null = null;
  button_top: number | null = null;
  iframe: HTMLIFrameElement | null = null;
  //
  container: any;
  iframe_wrap: any;

  toggle_left_btn: null | HTMLDivElement;
  toggle_right_btn: null | HTMLDivElement;
  //
  container_mode = ContainerMode.popup;
  progress_status = ProgressStatus.active;
  status = PopupStatus.hidden;
  //
  readonly toggle_button_height = 50;
  min_height = 128;
  min_width = 128;
  bubble_height = 64;
  bubble_width = 64;
  show_x = 300;
  show_y = 300;
  //
  rect: any = {};
  toggle_top = 200;
  dragging_initial_rect: any = {};
  //
  dragging_overlay: HTMLElement | null = null;
  dragging_flag = false;
  dragging_initial_mouse_x = 0;
  dragging_initial_mouse_y = 0;
  //
  config: any;
  project_css;
  logo_svg;
  content: ContentBasic;
  constructor(content: ContentBasic, config, project_css, logo_svg) {
    this.content = content;
    this.config = config;
    this.project_css = project_css;
    this.logo_svg = logo_svg;
  }
  transform_dimensions;
  mouse_was_moved = false;
  dragging_initialized = false;
  //
  get_state() {
    return {
      rect: this.rect,
      status: this.status,
    };
  }
  async set_state({ rect, status }) {
    await this.set_status(status);
    this.set_transition_status("not-active");
    this.rect_set_apply(rect);
  }
  set_position(left, top) {
    this.rect.left = left;
    this.rect.top = top;
    this.rect_apply();
  }
  //
  get_width(): number {
    return document.documentElement.getBoundingClientRect().width as number;
  }
  get_height() {
    // return document.documentElement.getBoundingClientRect().height as number;
    return window.innerHeight;
    document.documentElement.getBoundingClientRect().height as number;
  }
  get_rect_sidebar_left(width_type: "default" | "current" = "default") {
    let width: number;
    if (width_type === "default") {
      width = 440;
    } else if (width_type === "current") {
      width = this.container.clientWidth;
      const doc_width_offset = this.get_width() - 42;
      if (width > doc_width_offset) {
        width = doc_width_offset;
      }
    }
    let height = window.innerHeight;
    let top = 0;
    let left = 0;
    return { top, left, width, height };
  }
  get_rect_sidebar_top() {
    // let width = window.innerWidth * 0.9;
    // let height = window.innerHeight * 0.9;
    // let top = window.innerHeight * 0.05;
    // let left = window.innerWidth * 0.05;
    let width = window.innerWidth - 42 - 42;
    let height = window.innerHeight - 42 - 42;
    let top = 42;
    let left = 42;
    return { top, left, width, height };
  }
  get_popup_rect_onboarding() {
    let width = 720;
    let height = window.innerHeight * 0.8;
    let top = (window.innerHeight - height) / 2;
    let left = (this.get_width() - width) / 2;
    return { top, left, width, height };
  }
  get_rect_sidebar_right(width_type: "default" | "current" = "default") {
    let width: number;
    let left: number;

    const doc_width = this.get_width();

    if (width_type === "default") {
      width = 440;
      left = doc_width - 440;
    } else if (width_type === "current") {
      width = this.container.clientWidth;

      if (width > doc_width - 42) {
        width = doc_width - 42;
      }
      left = doc_width - width;
    }

    let height = window.innerHeight;
    let top = 0;
    return { top, left, width, height };
  }
  get_rect_initial() {
    return {
      left: this.get_width() - 32 - 520,
      top: 32,
      width: 520,
      height: 620,
    };
  }
  get_rect_initial_center() {
    let width = 520;
    let height = 620;
    return {
      left: (this.get_width() - width) / 2,
      top: (this.get_height() - height) / 2,
      width,
      height,
    };
  }
  get_popup_rect_small() {
    let width = 440;
    let height = 600;
    let top = (window.innerHeight - height) / 2;
    let left = (this.get_width() - width) / 2;
    return { top, left, width, height };
  }
  get_rect_after_bubble() {
    //
    let dwr = this.get_draggable_window_rect();
    console.log("dwr", dwr);
    //
    let rect: any = {};
    rect.width = dwr.width;
    rect.height = dwr.height;
    let new_top = this.rect.top - dwr.height / 2 + this.bubble_height / 2;
    let new_left = this.rect.left - dwr.width / 2 + this.bubble_width / 2;
    //
    new_left = Math.max(24, new_left);
    new_left = Math.min(new_left, this.get_width() - dwr.width - 24);
    // //
    new_top = Math.max(24, new_top);
    new_top = Math.min(new_top, window.innerHeight - dwr.height - 24);
    //
    rect.top = new_top;
    rect.left = new_left;
    return rect;
  }
  get_rect_after_sidebar_top(mouse_x, mouse_y) {
    //
    let dwr = this.get_draggable_window_rect();
    //
    let rect: any = {};
    rect.width = dwr.width;
    rect.height = dwr.height;
    let new_top = this.rect.top;
    // let new_left = this.rect.left + (this.rect.width - dwr.width) / 2;
    //
    let offset_left = (window.innerWidth - this.rect.width) / 2;
    let percent = (mouse_x - offset_left * 2) / this.rect.width;
    let new_left = offset_left + (this.rect.width - dwr.width) * percent;
    //
    // new_left = Math.max(24, new_left);
    // new_left = Math.min(new_left, this.get_width() - dwr.width - 24);
    // // //
    // new_top = Math.max(24, new_top);
    // new_top = Math.min(new_top, window.innerHeight - dwr.height - 24);
    //
    rect.top = new_top;
    rect.left = new_left;
    return rect;
  }
  get_popup_rect_big() {
    let width = this.get_width() * 0.9;
    let height = window.innerHeight * 0.9;
    let top = (window.innerHeight - height) / 2;
    let left = (this.get_width() - width) / 2;
    return { top, left, width, height };
  }
  get_sidebar_rect() {
    return {
      top: 0,
      left: 0,
      width: 460,
      height: window.innerHeight,
    };
  }
  update_body() {
    try {
      if (this.sidebar_mode === "resize-body" && this.status === PopupStatus.sidebar_right) {
        document.body.style.width = `calc(100% - ${this.rect.width}px)`;
      } else if (this.sidebar_mode === "resize-body" && this.status === PopupStatus.sidebar_right_hidden) {
        document.body.style.width = "100%";
      } else {
        document.body.style.width = "100%";
      }
    } catch (e) {}
  }
  rect_apply() {
    //
    // this.container.style.top = this.rect.top + "px";
    this.container.style.left = this.rect.left + "px";
    this.container.style.top = this.rect.top + "px";
    // this.container.style.transform = `translate(${this.rect.left}px, ${this.rect.top}px)`;
    // .left = this.rect.left + "px";
    //
    this.container.style.width = this.rect.width + "px";
    this.container.style.height = this.rect.height + "px";
    //
    this.update_body();
    //
  }
  rect_set_apply(rect) {
    this.rect = rect;
    this.rect_apply();
  }
  //
  set_class(prefix, value) {
    for (let class_name of this.container.classList) {
      if (class_name.startsWith(prefix)) {
        this.container.classList.remove(class_name);
      }
    }
    this.container.classList.add(`${prefix}-${value}`);
  }
  set_overlay_status(status) {
    //
    this.overlay?.classList.remove("chromane-active");
    this.overlay?.classList.remove("chromane-not-active");
    this.overlay?.classList.remove("chromane-dragging");
    this.overlay?.classList.add(`chromane-${status}`);
    //
  }
  set_transition_status(status) {
    //
    this.container.offsetHeight;
    this.container.classList.remove("chromane-transition-status-active");
    this.container.classList.remove("chromane-transition-status-active-dimensions");
    this.container.classList.remove("chromane-transition-status-not-active");
    this.container.classList.add(`chromane-transition-status-${status}`);
    this.container.offsetHeight;
    //
  }
  set_progress_status(status) {
    //
    this.container.offsetHeight;
    this.container.classList.remove("chromane-progress-status-active");
    this.container.classList.remove("chromane-progress-status-not-active");
    this.container.classList.add(`chromane-progress-status-${status}`);
    this.container.offsetHeight;
  }
  set_container_mode(mode: any) {
    //
    this.container_mode = mode;
    this.container.offsetHeight;
    this.container.classList.remove("chromane-container-mode-bubble");
    this.container.classList.remove("chromane-container-mode-popup");
    this.container.classList.remove("chromane-container-mode-sidebar");
    this.container.classList.add(`chromane-container-mode-${mode}`);
    this.container.offsetHeight;
  }
  storage: any;
  shadow: any;
  async init(iframe_url: string) {
    //
    //
    //
    // this.set_status(storage.popup.status);
    // this.rect_set_apply(storage.popup.rect);
    //
    this.storage = await this.storage_get();
    this.rect = this.storage.popup.rect;
    //
    let style = util.html_to_element(`<style class = 'chromane-style' >${popup_css}${this.project_css}</style>`);
    // document.documentElement.prepend(style);
    //
    this.overlay = util.html_to_element(`<div class = "chromane-overlay chromane-not-active" ></div>`) as HTMLElement;
    // document.documentElement.prepend(this.overlay);
    //
    this.container = util.html_to_element(popup_html);
    this.set_container_mode(ContainerMode.popup);
    this.set_progress_status("active");
    this.iframe = this.container.querySelector("iframe");
    this.iframe.name = "chromane-popup";
    this.container.querySelector(".chromane-logo").innerHTML = this.logo_svg;
    this.container.querySelector(".chromane-logo-progress").innerHTML = logo_progress_svg + this.logo_svg;
    //
    //
    if (this.iframe) {
      this.iframe.src = iframe_url;
    }
    //
    const host = util.html_to_element(`<div class = "chromane-shadow-root-host" ></div>`) as HTMLElement;
    host.style.setProperty("all", "unset", "important");
    host.style.setProperty("white-space", "normal", "important");
    //
    const shadow = host.attachShadow({ mode: "open" });
    this.shadow = shadow;
    shadow.appendChild(this.container);
    shadow.appendChild(style);
    shadow.appendChild(this.overlay);
    document.documentElement.prepend(host);
    //
    // this.rect_set_apply({
    //   left: this.get_width() - 200,
    //   top: -100,
    //   width: 64,
    //   height: 64,
    // });
    // dragging
    this.dragging_overlay = this.container.querySelector(".chromane_iframe_dragging_overlay");
    //
    let mousemove_listener = (event) => {
      this.mouse_was_moved = true;
      this.dragging_flag = true;
      this.container.classList.add("chromane-dragging");
      //
      if (this.dragging_initialized === false) {
        //
        this.dragging_initialized = true;
        this.set_overlay_status("dragging");
        this.container.classList.remove("chromane-size-transition");
        //
        this.dragging_initial_rect = util.clone(this.rect);
        //
        this.dragging_initial_mouse_x = event.clientX;
        this.dragging_initial_mouse_y = event.clientY;
        //
      }
      this.document_mousemove_handler(event);
    };
    let mouseup_listener = (event) => {
      if (this.mouse_was_moved === false) {
        if (this.container_mode === ContainerMode.bubble) {
          this.handle_bubble_click();
        }
      } else if (this.container_mode === ContainerMode.bubble && this.status === PopupStatus.button) {
        this.handle_bubble_click();
      }

      this.dragging_flag = true;
      this.container.classList.remove("chromane-dragging");
      this.set_overlay_status("not-active");
      // this.document_mousemove_handler(event);
      document.removeEventListener("mousemove", mousemove_listener);
      document.removeEventListener("mouseup", mouseup_listener);
      this.exec_after_mouse_up();
    };
    let mousedown_listener = (event) => {
      // console.log(event.target.classList);
      // console.log(event.which);
      if (event.which !== 1) {
        return;
      }
      //
      this.set_transition_status("not-active");
      this.dragging_initialized = false;
      this.mouse_was_moved = false;
      //
      if (event.target.classList.contains("chromane_iframe_resizing-top")) {
        this.transform_dimensions = ["top"];
      } else if (event.target.classList.contains("chromane_iframe_resizing-right")) {
        this.transform_dimensions = ["right"];
      } else if (event.target.classList.contains("chromane_iframe_resizing-bottom")) {
        this.transform_dimensions = ["bottom"];
      } else if (event.target.classList.contains("chromane_iframe_resizing-left")) {
        this.transform_dimensions = ["left"];
      } else if (event.target.classList.contains("chromane_iframe_resizing-top-left")) {
        this.transform_dimensions = ["top", "left"];
      } else if (event.target.classList.contains("chromane_iframe_resizing-top-right")) {
        this.transform_dimensions = ["top", "right"];
      } else if (event.target.classList.contains("chromane_iframe_resizing-bottom-right")) {
        this.transform_dimensions = ["bottom", "right"];
      } else if (event.target.classList.contains("chromane_iframe_resizing-bottom-left")) {
        this.transform_dimensions = ["bottom", "left"];
      } else {
        this.transform_dimensions = ["position"];
      }
      //
      document.addEventListener("mousemove", mousemove_listener);
      document.addEventListener("mouseup", mouseup_listener);
    };
    //
    this.dragging_overlay?.addEventListener("mousedown", mousedown_listener);
    this.container.querySelector(".chromane_iframe_resizing-top").addEventListener("mousedown", mousedown_listener);
    this.container.querySelector(".chromane_iframe_resizing-left").addEventListener("mousedown", mousedown_listener);
    this.container.querySelector(".chromane_iframe_resizing-right").addEventListener("mousedown", mousedown_listener);
    this.container.querySelector(".chromane_iframe_resizing-bottom").addEventListener("mousedown", mousedown_listener);
    this.container.querySelector(".chromane_iframe_resizing-top-left").addEventListener("mousedown", mousedown_listener);
    this.container.querySelector(".chromane_iframe_resizing-top-right").addEventListener("mousedown", mousedown_listener);
    this.container.querySelector(".chromane_iframe_resizing-bottom-right").addEventListener("mousedown", mousedown_listener);
    this.container.querySelector(".chromane_iframe_resizing-bottom-left").addEventListener("mousedown", mousedown_listener);
    //
    this.init_sidebar_toggle();

    window.addEventListener("resize", () => {
      this.handle_window_resize();
    });
  }

  init_sidebar_toggle() {
    this.toggle_left_btn = this.container.querySelector(".chromane-toggle-left");
    this.toggle_right_btn = this.container.querySelector(".chromane-toggle-right");

    this.set_toggle_pos_apply();

    // state
    let shift_y = 0;
    let toggle_initial_mouse_y = 0;
    let active_toggle_btn: HTMLElement | null = null;
    let toggle_mouse_was_moved = false;

    const add_dragging_status = (action: "start" | "end") => {
      if (action === "start") {
        this.container.dataset.toggleDrag = "true";
      } else {
        this.container.dataset.toggleDrag = "false";
      }
    };

    let toggle_mousedown_listener = (event: MouseEvent) => {
      if (event.which !== 1) {
        return;
      }

      if (this.status === PopupStatus.sidebar_left || this.status === PopupStatus.sidebar_left_hidden) {
        active_toggle_btn = this.toggle_left_btn;
      } else if (this.status === PopupStatus.sidebar_right || this.status === PopupStatus.sidebar_right_hidden) {
        active_toggle_btn = this.toggle_right_btn;
      } else {
        return;
      }
      toggle_mouse_was_moved = false;
      toggle_initial_mouse_y = event.clientY;

      document.addEventListener("mousemove", toggle_mousemove_listener);
      document.addEventListener("mouseup", toggle_mouseup_listener);
    };

    let toggle_mousemove_listener = (e: MouseEvent) => {
      if (!toggle_mouse_was_moved) {
        const move_diff = Math.abs(toggle_initial_mouse_y - e.clientY);

        if (move_diff > 10) {
          toggle_mouse_was_moved = true;
          const rect = active_toggle_btn.getBoundingClientRect();
          shift_y = rect.top - e.clientY;
        }
      } else {
        const new_y = e.clientY + shift_y;
        this.set_toggle_pos_apply(new_y);
        add_dragging_status("start");
      }
    };
    let toggle_mouseup_listener = (e) => {
      if (toggle_mouse_was_moved === false) {
        this.handle_toggle_click();
      }
      document.removeEventListener("mousemove", toggle_mousemove_listener);
      document.removeEventListener("mouseup", toggle_mouseup_listener);
      add_dragging_status("end");
    };

    this.toggle_left_btn.addEventListener("mousedown", toggle_mousedown_listener);
    this.toggle_right_btn.addEventListener("mousedown", toggle_mousedown_listener);
  }
  // this is executed when the content script is launched after a page refresh
  // not after the user action
  async open_from_storage() {
    // console.log("open_from_storage");
    // // console.log("open_from_storage", state);
    // if (this.storage.popup_status === PopupStatus.draggable_window) {
    //   this.toggle();
    // }
    this.rect = this.storage.popup.rect;
    this.rect_set_apply(this.storage.popup.rect);
    this.set_status(this.storage.popup.status);
  }

  sidebar_right_on_release = false;
  sidebar_left_on_release = false;
  sidebar_top_on_release = false;
  bubble_on_release = false;

  async show_as_sidebar() {
    let rect = this.get_sidebar_rect();
    rect.left = this.get_width();
    this.rect_set_apply(rect);
    this.status = PopupStatus.sidebar_right_hidden;
    this.set_class("chromane-status", this.status);
    this.set_container_mode(ContainerMode.sidebar);
  }
  async show_as_window_center() {
    let rect = this.get_rect_initial_center();
    this.rect_set_apply(rect);
    this.status = PopupStatus.draggable_window;
    this.set_class("chromane-status", this.status);
    this.set_container_mode(ContainerMode.popup);
  }
  async set_sidebar_wide() {
    if (this.status === PopupStatus.sidebar_right) {
      let width = 720;
      let rect = this.rect;
      rect.left = this.get_width() - width;
      rect.width = width;
      this.rect_set_apply(rect);
    }
  }

  async set_toggle_pos_apply(value: number = this.toggle_top) {
    if (value < 0) {
      value = 0;
    }
    value = Math.max(0, value);
    value = Math.min(window.innerHeight - this.toggle_button_height, value);
    this.toggle_top = value;

    this.toggle_left_btn.style.top = this.toggle_top + "px";
    this.toggle_right_btn.style.top = this.toggle_top + "px";
  }
  async set_sidebar_normal() {}
  handle_bubble_click() {
    //
    this.set_transition_status("active");
    this.set_class("chromane-logo-status", "not-active");
    this.set_container_mode(ContainerMode.popup);
    this.status = PopupStatus.draggable_window;
    this.set_class("chromane-status", this.status);
    let rect = this.get_rect_after_bubble();
    // let rect = { width: 420, height: 600, top: 200, left: 420 };
    this.rect_set_apply(rect);
    //
    this.sidebar_right_on_release = false;
    this.sidebar_left_on_release = false;
    this.sidebar_top_on_release = false;
    this.bubble_on_release = false;
  }

  handle_toggle_click() {
    if (this.status === PopupStatus.sidebar_right_hidden) {
      this.set_status(PopupStatus.sidebar_right);
    } else if (this.status === PopupStatus.sidebar_right) {
      this.set_status(PopupStatus.sidebar_right_hidden);
    } else if (this.status === PopupStatus.sidebar_left_hidden) {
      this.set_status(PopupStatus.sidebar_left);
    } else if (this.status === PopupStatus.sidebar_left) {
      this.set_status(PopupStatus.sidebar_left_hidden);
    }
  }
  document_mousemove_handler(event) {
    let mouse_x = event.clientX;
    let mouse_y = event.clientY;
    let d_x = this.dragging_initial_mouse_x - mouse_x;
    let d_y = this.dragging_initial_mouse_y - mouse_y;
    let new_x = this.dragging_initial_rect.left - d_x;
    let new_y = this.dragging_initial_rect.top - d_y;
    //
    new_x = Math.max(0, new_x);
    new_x = Math.min(new_x, this.get_width() - this.rect.width);
    //
    new_y = Math.max(0, new_y);
    new_y = Math.min(new_y, window.innerHeight - this.rect.height);
    //
    // console.log("distance", distance(d_x, d_y));
    if (this.transform_dimensions.includes("position")) {
      if (
        //
        (this.status === PopupStatus.sidebar_left || //
          this.status === PopupStatus.sidebar_right ||
          this.status === PopupStatus.draggable_overlay) &&
        distance(d_x, d_y) > 24
      ) {
        // todo: add transitions when unsticking the popup
        // either from a sidebar or a draggable_overlay
        let dwr = this.get_draggable_window_rect();
        // this.set_transition_status("active-dimensions");
        // this.set_transition_status("active");
        if (this.status === PopupStatus.draggable_overlay) {
          let rect = this.get_rect_after_sidebar_top(mouse_x, mouse_y);
          console.log("get_rect_after_sidebar_top", rect);
          new_y = rect.top;
          new_x = rect.left;
          //
          this.dragging_initial_rect.left = rect.left;
          //
          this.rect.height = dwr.height;
          this.rect.width = dwr.width;
          this.rect.top = new_y;
          this.rect.left = new_x;
          //
          // this.rect_apply();
          // util.wait(1300).then(() => {
          //   this.set_transition_status("not-active");
          // });
        } else {
          this.rect.height = Math.min(dwr.height, window.innerHeight - 200);
          this.rect.width = Math.min(dwr.width, window.innerHeight - 200);
        }
        this.status = PopupStatus.draggable_window;
        this.set_class("chromane-status", this.status);
        this.set_container_mode(ContainerMode.popup);
        // this.set_transition_status("not-active");
      }
      if (this.status === PopupStatus.draggable_window || this.status === PopupStatus.bubble) {
        this.rect.top = new_y;
        this.rect.left = new_x;
        this.rect_apply();
      }
    }
    if (this.transform_dimensions.includes("top")) {
      if (
        //
        this.status !== PopupStatus.sidebar_left &&
        this.status !== PopupStatus.sidebar_right &&
        this.status !== PopupStatus.sidebar_left_hidden &&
        this.status !== PopupStatus.sidebar_right_hidden &&
        this.status !== PopupStatus.bubble
      ) {
        let new_height = this.dragging_initial_rect.height + d_y;
        if (new_height > this.min_height) {
          this.rect.height = new_height;
          this.rect.top = new_y;
          this.rect_apply();
        }
      }
    }
    if (this.transform_dimensions.includes("right")) {
      if (
        //
        this.status !== PopupStatus.sidebar_right &&
        this.status !== PopupStatus.sidebar_left_hidden &&
        this.status !== PopupStatus.sidebar_right_hidden &&
        this.status !== PopupStatus.bubble
      ) {
        let new_width = this.dragging_initial_rect.width - d_x;
        if (new_width > this.min_width) {
          this.rect.width = new_width;
          this.rect_apply();
        }
      }
    }
    if (this.transform_dimensions.includes("bottom")) {
      if (
        //
        this.status !== PopupStatus.sidebar_left &&
        this.status !== PopupStatus.sidebar_right &&
        this.status !== PopupStatus.sidebar_left_hidden &&
        this.status !== PopupStatus.sidebar_right_hidden &&
        this.status !== PopupStatus.bubble
      ) {
        let new_height = this.dragging_initial_rect.height - d_y;
        if (new_height > this.min_height) {
          this.rect.height = new_height;
          this.rect_apply();
        }
      }
    }
    if (this.transform_dimensions.includes("left")) {
      if (
        //
        this.status !== PopupStatus.sidebar_left &&
        this.status !== PopupStatus.sidebar_left_hidden &&
        this.status !== PopupStatus.sidebar_right_hidden &&
        this.status !== PopupStatus.bubble
      ) {
        let new_width = this.dragging_initial_rect.width + d_x;
        if (new_width > this.min_width) {
          this.rect.width = new_width;
          this.rect.left = new_x;
          this.rect_apply();
          // if (this.sidebar_mode === "resize-body") {
          //   if (this.status === PopupStatus.sidebar_right) {
          //     document.body.style.width = `calc(100% - ${this.rect.width}px)`;
          //   }
          // }
        }
      }
    }
    //
    this.exec_after_mouse_move();
  }
  exec_after_mouse_move() {
    if (
      //
      this.status === PopupStatus.draggable_window &&
      this.transform_dimensions.includes("position") &&
      this.rect.top < 24
    ) {
      this.sidebar_top_on_release = true;
    } else if (
      //
      this.status === PopupStatus.draggable_window &&
      this.transform_dimensions.includes("position") &&
      this.rect.left + 24 > this.get_width() - this.rect.width
    ) {
      this.sidebar_right_on_release = true;
    } else if (
      //
      this.status === PopupStatus.draggable_window &&
      this.transform_dimensions.includes("position") &&
      this.rect.left < 24
    ) {
      this.sidebar_left_on_release = true;
    } else if (
      //
      this.status === PopupStatus.draggable_window &&
      this.container_mode === ContainerMode.popup &&
      (this.rect.width < 240 || this.rect.height < 240)
    ) {
      this.set_class("chromane-logo-status", "active");
      this.bubble_on_release = true;
    } else {
      this.sidebar_right_on_release = false;
      this.sidebar_left_on_release = false;
      this.sidebar_top_on_release = false;
      this.bubble_on_release = false;
    }
    //
    if (
      //
      this.status === PopupStatus.draggable_window &&
      this.container_mode === ContainerMode.popup
    ) {
      if (this.rect.width < 240 || this.rect.height < 240) {
        this.set_class("chromane-logo-status", "active");
      } else {
        this.set_class("chromane-logo-status", "not-active");
      }
    }
  }
  exec_after_mouse_up() {
    if (this.sidebar_right_on_release) {
      this.trigger_sidebar_right_on_release();
    } else if (this.sidebar_left_on_release) {
      this.trigger_sidebar_left_on_release();
    } else if (this.sidebar_top_on_release) {
      this.trigger_sidebar_top_on_release();
    } else if (this.bubble_on_release) {
      this.trigger_bubble_on_release();
    }
    let draggable_window_rect;
    if (
      //
      this.sidebar_right_on_release === false &&
      this.sidebar_left_on_release === false &&
      this.sidebar_top_on_release === false &&
      this.bubble_on_release === false &&
      this.status === PopupStatus.draggable_window
    ) {
      draggable_window_rect = util.clone(this.rect);
    } else {
      draggable_window_rect = this.storage.popup.draggable_window_rect;
    }
    console.log("this.storage_set");
    this.storage_set({
      popup: {
        rect: this.rect,
        draggable_window_rect,
        status: this.status,
        user_status: this.status,
      },
    });
    //
  }
  async storage_get() {
    let storage: any = await chrome.storage.local.get(["popup"]);
    console.log("storage", storage);
    console.log("storage.popup", storage.popup);
    // if there is no storage.popup - that means this is our first launch
    // in that case, if the height of the page is small -
    // open the popup in sidebar mode
    if (!storage.popup) {
      if (window.innerHeight > 640) {
        var default_storage_popup = {
          draggable_window_rect: this.get_rect_initial(),
          rect: this.get_rect_initial(),
          status: PopupStatus.draggable_window,
          user_status: PopupStatus.draggable_window,
        };
      } else {
        var default_storage_popup = {
          draggable_window_rect: this.get_rect_initial(),
          rect: this.get_rect_sidebar_right(),
          status: PopupStatus.sidebar_right,
          user_status: PopupStatus.sidebar_right,
        };
      }
      storage.popup = default_storage_popup;
    }
    console.log("storage_get", storage);
    return storage;
  }
  storage_enabled: boolean = true;
  storage_set(storage) {
    this.storage = storage;
    console.log("storage_set", storage);
    if (this.storage_enabled) {
      chrome.storage.local.set(storage);
    }
  }
  trigger_sidebar_right_on_release() {
    this.set_transition_status(TransitionStatus.active);
    //
    // console.log("setting",util.clone(this.rect));this.last_popup_rect = util.clone(this.dragging_initial_rect);
    //
    let rect = this.get_rect_sidebar_right();
    this.rect_set_apply(rect);
    this.status = PopupStatus.sidebar_right;
    this.set_container_mode(ContainerMode.sidebar);
    this.set_class("chromane-status", this.status);

    // Shift the toggle btn position if is not visible
    this.set_toggle_pos_apply();
    //
    this.update_body();
    //
  }
  trigger_sidebar_left_on_release() {
    this.set_transition_status(TransitionStatus.active);
    // console.log("setting",util.clone(this.rect));this.last_popup_rect = util.clone(this.dragging_initial_rect);
    let rect = this.get_rect_sidebar_left();
    this.rect_set_apply(rect);
    this.status = PopupStatus.sidebar_left;
    this.set_container_mode(ContainerMode.sidebar);
    this.set_class("chromane-status", this.status);

    // Shift the toggle btn position if is not visible
    this.set_toggle_pos_apply();
  }
  trigger_sidebar_top_on_release() {
    this.set_transition_status(TransitionStatus.active);
    let rect = this.get_rect_sidebar_top();
    this.rect_set_apply(rect);
    this.status = PopupStatus.draggable_overlay;
    this.set_overlay_status("active");
    this.set_class("chromane-status", this.status);
  }
  trigger_bubble_on_release() {
    //
    // console.log("setting",util.clone(this.rect));this.last_popup_rect = util.clone(this.dragging_initial_rect);

    this.rect.top = this.rect.top + this.rect.height / 2 - this.bubble_height / 2;
    this.rect.left = this.rect.left + this.rect.width / 2 - this.bubble_width / 2;

    this.rect.height = this.bubble_height;
    this.rect.width = this.bubble_width;

    this.set_transition_status(TransitionStatus.active);
    this.rect_apply();
    this.set_container_mode(ContainerMode.bubble);
    this.set_class("chromane-logo-status", "active");
    this.status = PopupStatus.bubble;
    this.set_class("chromane-status", this.status);
    //
  }
  handle_popup_overlay_click() {
    this.set_status(PopupStatus.hidden);
  }

  async show() {
    if (this.status === PopupStatus.hidden) {
      this.set_status(this.storage.popup.user_status);
      this.content.proxy_cloud_iframe.set_popup_status(this.storage.popup.user_status);
    }
  }
  show_fast() {
    this.set_transition_status(TransitionStatus.not_active);
    this.container.style.opacity = 1;
    this.rect_set_apply({
      top: 45,
      left: 45,
      width: 420,
      height: 420,
    });
  }
  async hide() {
    if (this.status === PopupStatus.sidebar_left) {
      this.set_status(PopupStatus.sidebar_left_hidden);
    } else if (this.status === PopupStatus.sidebar_right) {
      this.set_status(PopupStatus.sidebar_right_hidden);
    } else {
      this.set_status(PopupStatus.hidden);
    }
    this.content.proxy_cloud_iframe.set_popup_status(PopupStatus.hidden);
  }
  set_height(height) {
    this.rect.height = height;
    this.rect_apply();
  }
  toggle() {
    if (this.status === PopupStatus.hidden) {
      this.show();
    } else if (this.status === PopupStatus.draggable_window) {
      this.hide();
      // this.set_status(PopupMode.normal);
    } else if (this.status === PopupStatus.sidebar_right_hidden) {
      this.set_status(PopupStatus.sidebar_right);
    } else if (this.status === PopupStatus.sidebar_left_hidden) {
      this.set_status(PopupStatus.sidebar_left);
    } else if (this.status === PopupStatus.sidebar_right) {
      this.set_status(PopupStatus.sidebar_right_hidden);
    } else if (this.status === PopupStatus.sidebar_left) {
      this.set_status(PopupStatus.sidebar_left_hidden);
    }
  }
  get_draggable_window_rect() {
    return util.clone(this.storage.popup.draggable_window_rect);
  }
  sidebar_mode = "default";
  set_sidebar_mode(mode) {
    this.sidebar_mode = mode;
  }
  async set_status(status, info?) {
    //
    console.log("set_status", status, this.status);
    let new_status;
    let solid_popup_rect = this.get_popup_rect_small();
    let draggable_overlay_rect;
    if (status === "auth_popup") {
      new_status = PopupStatus.solid_popup;
      solid_popup_rect = this.get_popup_rect_small();
    } else if (status === "upgrade_popup") {
      new_status = PopupStatus.draggable_overlay;
      draggable_overlay_rect = this.get_popup_rect_big();
    } else if (status === PopupStatus.draggable_overlay) {
      new_status = PopupStatus.draggable_overlay;
      if (info && info.width && info.height) {
        let width = info.width;
        let height = info.height;
        let top = (window.innerHeight - height) / 2;
        let left = (window.innerWidth - width) / 2;
        draggable_overlay_rect = { top, left, width, height };
      } else {
        draggable_overlay_rect = this.get_rect_sidebar_top();
      }
    } else if (status === "onboarding_popup") {
      new_status = PopupStatus.draggable_window;
      this.storage.popup.rect = this.get_popup_rect_onboarding();
    } else {
      new_status = status as PopupStatus;
    }
    if (this.status === PopupStatus.hidden && new_status === PopupStatus.button) {
      // define target rect
      let button_rect = info;
      let target_rect = {
        width: 320,
        height: 64,
        top: button_rect.top - 32 - 64,
        left: button_rect.left - 360,
      };
      // prepare
      this.set_transition_status(TransitionStatus.not_active);
      this.container.style.opacity = 0;
      this.rect_set_apply(target_rect);
      // animate
      this.set_transition_status(TransitionStatus.active);
      target_rect.top += 64;
      this.container.style.opacity = 1;
      this.rect_set_apply(target_rect);
    } else if (this.status === PopupStatus.hidden && new_status === PopupStatus.draggable_window) {
      this.set_transition_status(TransitionStatus.not_active);
      let rect_real = util.clone(this.storage.popup.rect);
      let rect_temp = util.clone(this.storage.popup.rect);
      rect_temp.top = rect_real.top - 64;
      this.container.style.opacity = 0;
      this.rect_set_apply(rect_temp);
      this.set_transition_status(TransitionStatus.active);
      this.container.style.opacity = 1;
      this.rect_set_apply(rect_real);
    } else if (this.status === PopupStatus.hidden && new_status === PopupStatus.solid_popup) {
      // prepare
      this.set_transition_status(TransitionStatus.not_active);
      let rect = util.clone(solid_popup_rect);
      if (rect) {
        rect.top = rect.top - 64;
      }
      this.container.style.opacity = 0;
      this.rect_set_apply(rect);
      // animate
      this.set_transition_status(TransitionStatus.active);
      this.container.style.opacity = 1;
      this.rect_set_apply(solid_popup_rect);
      this.set_overlay_status("active");
      //
    } else if (this.status === PopupStatus.hidden && new_status === PopupStatus.sidebar_right) {
      this.set_class("chromane-transition-status", "active");
      this.set_container_mode(ContainerMode.sidebar);
      let rect = this.get_sidebar_rect();
      rect.left = this.get_width() - rect.width;
      this.container.style.opacity = 1;
      this.rect_set_apply(rect);
    } else if (this.status === PopupStatus.hidden && new_status === PopupStatus.sidebar_left) {
      this.set_class("chromane-transition-status", "active");
      this.set_container_mode(ContainerMode.sidebar);
      this.rect.left = 0;
      this.rect_apply();
    } else if (this.status === PopupStatus.hidden && new_status === PopupStatus.sidebar_right_hidden) {
      this.set_class("chromane-transition-status", "active");
      this.rect.left = this.get_width();
      this.rect_apply();
    } else if (this.status === PopupStatus.hidden && new_status === PopupStatus.sidebar_left_hidden) {
      this.set_class("chromane-transition-status", "active");
      this.rect.left = -this.rect.width;
      this.rect_apply();
    } else if (this.status === PopupStatus.hidden && new_status === PopupStatus.bubble) {
      this.set_transition_status(TransitionStatus.active);
      this.rect_apply();
      this.set_container_mode(ContainerMode.bubble);
      this.set_class("chromane-logo-status", "active");
    } else if (this.status === PopupStatus.draggable_window && new_status === PopupStatus.draggable_overlay) {
      this.set_transition_status(TransitionStatus.active);
      let rect = draggable_overlay_rect;
      this.rect_set_apply(rect);
      this.status = PopupStatus.draggable_overlay;
      this.set_overlay_status("active");
      this.set_class("chromane-logo-status", "not-active");
      this.set_container_mode(ContainerMode.popup);
      this.rect_set_apply(rect);
    } else if (this.status === PopupStatus.bubble && new_status === PopupStatus.draggable_overlay) {
      this.set_transition_status(TransitionStatus.active);
      let rect = draggable_overlay_rect;
      this.rect_set_apply(rect);
      this.status = PopupStatus.draggable_overlay;
      this.set_overlay_status("active");
      this.set_class("chromane-logo-status", "not-active");
      this.set_container_mode(ContainerMode.popup);
      this.rect_set_apply(rect);
    } else if (this.status === PopupStatus.draggable_window && new_status === PopupStatus.bubble) {
      //
      let new_rect: any = {};
      new_rect.top = this.rect.top + this.rect.height / 2 - this.bubble_height / 2;
      new_rect.left = this.rect.left + this.rect.width / 2 - this.bubble_width / 2;
      new_rect.height = this.bubble_height;
      new_rect.width = this.bubble_width;
      //
      this.set_transition_status(TransitionStatus.active);
      this.rect_set_apply(new_rect);
      this.set_container_mode(ContainerMode.bubble);
      this.set_class("chromane-logo-status", "active");
    } else if (this.status === PopupStatus.draggable_overlay && new_status === PopupStatus.bubble) {
      //
      let new_rect: any = {};
      new_rect.top = this.rect.top + this.rect.height / 2 - this.bubble_height / 2;
      new_rect.left = this.rect.left + this.rect.width / 2 - this.bubble_width / 2;
      new_rect.height = this.bubble_height;
      new_rect.width = this.bubble_width;
      //
      this.set_overlay_status("not-active");
      this.set_transition_status(TransitionStatus.active);
      this.rect_set_apply(new_rect);
      this.set_container_mode(ContainerMode.bubble);
      this.set_class("chromane-logo-status", "active");
    } else if (this.status === PopupStatus.sidebar_right && new_status === PopupStatus.bubble) {
      //
      let new_rect: any = {};
      new_rect.top = this.rect.top + this.rect.height / 2 - this.bubble_height / 2;
      new_rect.left = this.rect.left + this.rect.width / 2 - this.bubble_width / 2;
      new_rect.height = this.bubble_height;
      new_rect.width = this.bubble_width;
      //
      this.set_overlay_status("not-active");
      this.set_transition_status(TransitionStatus.active);
      this.rect_set_apply(new_rect);
      this.set_container_mode(ContainerMode.bubble);
      this.set_class("chromane-logo-status", "active");
    } else if (new_status === PopupStatus.solid_popup) {
      this.set_overlay_status("active");
      this.set_transition_status(TransitionStatus.active);
      this.rect_set_apply(solid_popup_rect);
    } else if (this.status === PopupStatus.sidebar_left && new_status === PopupStatus.sidebar_left_hidden) {
      this.set_class("chromane-transition-status", "active");
      this.rect.left = -this.rect.width;
      this.rect_apply();
    } else if (this.status === PopupStatus.sidebar_left_hidden && new_status === PopupStatus.sidebar_left) {
      this.set_class("chromane-transition-status", "active");
      this.rect.left = 0;
      this.rect_apply();
    } else if (this.status === PopupStatus.sidebar_right && new_status === PopupStatus.sidebar_right_hidden) {
      this.set_class("chromane-transition-status", "active");
      this.rect.left = this.get_width();
      this.rect_apply();
    } else if (this.status === PopupStatus.sidebar_right_hidden && new_status === PopupStatus.sidebar_right) {
      this.set_class("chromane-transition-status", "active");
      this.rect.left = this.get_width() - this.rect.width;
      this.rect_apply();
    } else if (this.status === PopupStatus.draggable_window && new_status === PopupStatus.sidebar_right) {
      this.set_transition_status(TransitionStatus.active);
      let rect = this.get_rect_sidebar_right();
      this.rect_set_apply(rect);
      this.status = PopupStatus.sidebar_right;
      this.set_container_mode(ContainerMode.sidebar);
      this.set_class("chromane-status", this.status);
      this.set_toggle_pos_apply();
      this.update_body();
    } else if (this.status === PopupStatus.draggable_overlay && new_status === PopupStatus.sidebar_right) {
      this.set_transition_status(TransitionStatus.active);
      let rect = this.get_rect_sidebar_right();
      this.rect_set_apply(rect);
      this.status = PopupStatus.sidebar_right;
      this.set_container_mode(ContainerMode.sidebar);
      this.set_overlay_status("not-active");
      this.set_class("chromane-status", this.status);
      this.set_toggle_pos_apply();
      this.update_body();
    } else if (this.status === PopupStatus.draggable_window && new_status === PopupStatus.hidden) {
      this.set_transition_status(TransitionStatus.active);
      let rect_real = util.clone(this.storage.popup.rect);
      let rect_temp = util.clone(this.storage.popup.rect);
      rect_temp.top = rect_real.top - 64;
      this.container.style.opacity = 0;
      this.rect_set_apply(rect_temp);
      this.rect = rect_real;
    } else if (new_status === PopupStatus.hidden) {
      // this.set_overlay_status("not-active");
      // this.set_transition_status(TransitionStatus.active);
      // this.rect.top = this.rect.top - 64;
      // this.rect_apply();
      // this.container.style.opacity = 0;
    } else if (this.status === PopupStatus.solid_popup && new_status === PopupStatus.draggable_window) {
      this.set_overlay_status("not-active");
      // animate
      this.set_transition_status(TransitionStatus.active);
      let rect = this.get_draggable_window_rect();
      this.container.style.opacity = 1;
      this.rect_set_apply(rect);
    } else if (this.status === PopupStatus.draggable_overlay && new_status === PopupStatus.draggable_window) {
      this.set_overlay_status("not-active");
      // animate
      this.set_transition_status(TransitionStatus.active);
      let rect = this.get_draggable_window_rect();
      this.container.style.opacity = 1;
      this.rect_set_apply(rect);
    }
    this.status = new_status;
    this.set_class("chromane-status", this.status);
    this.update_body();
    //
    let user_status;
    if (this.status === "hidden") {
      user_status = this.storage.popup.user_status;
    } else {
      user_status = this.status;
    }
    //
    let draggable_window_rect;
    if (this.status === PopupStatus.draggable_window) {
      draggable_window_rect = this.rect;
    } else {
      draggable_window_rect = this.storage.popup.draggable_window_rect;
    }
    //
    console.log("this.storage_set", this.rect, this.storage.popup.draggable_window_rect);
    this.storage_set({
      popup: {
        rect: this.rect,
        draggable_window_rect,
        status: this.status,
        user_status,
      },
    });
    //
  }

  shift_position_if_overflow(config: { padding: number; min_width: number; min_height: number } = { padding: 0, min_height: 100, min_width: 100 }) {
    const screen_padding = config.padding;

    const popup_rect: DOMRect = this.container.getBoundingClientRect();
    const rect_res = {
      top: popup_rect.top,
      left: popup_rect.left,
      width: popup_rect.width,
      height: popup_rect.height,
    };

    const doc_width = this.get_width();
    const doc_height = this.get_height();

    const doc_width_with_pad = doc_width - screen_padding;
    const doc_height_with_pad = doc_height - screen_padding;

    const overflow_x = doc_width_with_pad - popup_rect.right;
    if (overflow_x < 0) {
      rect_res.left = rect_res.left + overflow_x;
    }

    const overflow_y = doc_height_with_pad - popup_rect.bottom;
    if (overflow_y < 0) {
      rect_res.top = rect_res.top + overflow_y;
    }

    if (rect_res.top < config.padding) {
      rect_res.height = doc_height_with_pad - config.padding;
      rect_res.top = config.padding;
    }
    if (rect_res.left < config.padding) {
      rect_res.width = doc_width_with_pad - config.padding;
      rect_res.left = config.padding;
    }

    if (rect_res.width < config.min_width) {
      rect_res.width = config.min_width;
    }

    if (rect_res.height < config.min_height) {
      rect_res.height = config.min_height;
    }
    return rect_res;
  }

  async handle_window_resize() {
    if (this.status === PopupStatus.sidebar_left) {
      this.set_transition_status(TransitionStatus.not_active);
      let rect = this.get_rect_sidebar_left("current");
      this.rect_set_apply(rect);
      this.set_toggle_pos_apply();
    } else if (this.status === PopupStatus.sidebar_left_hidden) {
      this.set_transition_status(TransitionStatus.not_active);
      let rect = this.get_rect_sidebar_left("current");
      rect.left = -rect.width;
      this.rect_set_apply(rect);
      this.set_toggle_pos_apply();
    } else if (this.status === PopupStatus.sidebar_right) {
      this.set_transition_status(TransitionStatus.not_active);
      let rect = this.get_rect_sidebar_right("current");
      this.rect_set_apply(rect);
      this.set_toggle_pos_apply();
    } else if (this.status === PopupStatus.sidebar_right_hidden) {
      this.set_transition_status(TransitionStatus.not_active);
      let rect = this.get_rect_sidebar_right("current");
      rect.left = rect.left + rect.width;
      this.rect_set_apply(rect);
      this.set_toggle_pos_apply();
    } else if (this.status === PopupStatus.bubble) {
      let rect = this.shift_position_if_overflow({ padding: 0, min_height: 64, min_width: 64 });
      this.rect_set_apply(rect);
    } else if (this.status === PopupStatus.draggable_window) {
      let rect = this.shift_position_if_overflow({ padding: 42, min_height: 250, min_width: 250 });
      this.rect_set_apply(rect);
    } else if (this.status === PopupStatus.draggable_overlay) {
      this.set_transition_status(TransitionStatus.not_active);
      let rect = this.get_rect_sidebar_top();
      this.rect_set_apply(rect);
    }
  }
}
