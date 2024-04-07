// the purpose of this script is to be injected into windows that don't need chromane ui
// for example: when Perplexity Bulk Search opens multiple perplexity windows
// we need to inject a simple script that doesn't load the firebase iframe

import $ from "jquery";
import ActionsManager from "./ActionsManager";
import util from "@chromane/shared/ts/util";
import Operations from "./Operations";
//
util.wrap_class(Operations, []);
let operations = new Operations();
//
let app: any = {};
let state: any = {};
export default class ContentActions {
  actions_manager: ActionsManager;
  iframe: HTMLIFrameElement;
  iframe_wrap;
  location_hostname: string;
  // old content
  //
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
  async init() {}
  //
  async get_perplexity_search_result(query_arr) {
    //
    //
    //
    this.actions_manager = new ActionsManager();
    for (let query of query_arr) {
      await this.action_run(["wait_for_element_to_be_gone", "svg.animate-spin"]);
      let element = await util.wait_for_element(`.w-full textarea`);
      await this.sv2(element, query);
      await util.wait(100);
      let button = element.parentElement.querySelector("button.bg-super") as any;
      button.click();
      //
      // var event: any = new KeyboardEvent("keydown", {
      //   bubbles: true,
      //   code: "Enter",
      //   key: "Enter",
      //   keyCode: 13,
      //   which: 13,
      // } as any);
      // element.dispatchEvent(event);
      // var event: any = new Event("keyup", {
      //   bubbles: true,
      //   code: "Enter",
      //   key: "Enter",
      //   keyCode: 13,
      //   which: 13,
      // } as any);
      // element.dispatchEvent(event);
      // await util.wait(1000);
      // var event: any = new KeyboardEvent("keydown", {
      //   bubbles: true,
      //   code: "Enter",
      //   key: "Enter",
      //   keyCode: 13,
      //   which: 13,
      // } as any);
      // element.dispatchEvent(event);
      // var event: any = new Event("keyup", {
      //   bubbles: true,
      //   code: "Enter",
      //   key: "Enter",
      //   keyCode: 13,
      //   which: 13,
      // } as any);
      // element.dispatchEvent(event);
      // await util.wait(1000);

      //
      // event.bubbles = true;
      // event.code = "Enter";
      // event.key = "Enter";
      // event.keyCode = 13;
      // event.which = 13;
      //
      await util.wait(100);
      //
      //
      // let button: any = document.querySelectorAll(`button.bg-super`)[1];
      // button.click();
      // let prose = await chromane.wait_for_element(`.prose`);
      // let text = await this.wait_for_same_text(prose);
      await util.wait(100);
    }
    //
  }
  action_run(action) {
    return this.actions_manager.action_run(action);
  }
  fetch_json([url, data]) {
    return util.fetch_json(url, data);
  }
  fetch_text([url, data]) {
    return util.fetch_text(url, data);
  }
  async fetch_with_form_data([url, data, fields]) {
    let form_data = new FormData();
    data["image[file]"] = new File([""], "");
    Object.keys(fields).forEach((key) => {
      form_data.append(key, fields[key]);
    });

    data.body = form_data;
    let r = await fetch(url, data);
    let text = await r.text();
    return text;
  }
}
