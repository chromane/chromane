import CloudIframe from "chromane/front/ts/CloudIframe";
import ext_pages from "../vue/pages";
import store from "../vue/store";
export default class PrjCloudIframe extends CloudIframe {
  pages: any = [];
  constructor(ext_store, ext_config, pages) {
    super(ext_store, ext_config);
    this.pages = pages;
  }
  async init(vue_app) {
    for (let page of this.pages) {
      page.comp_name = "page_" + page.name;
      vue_app.component(page.comp_name, page.page);
    }
    store.active_page_comp_name = "page_main";
    store.drawer_items = this.pages;
    // this.proxy_content.
    // this.c.se;
    // this.a.
    // this.proxy_content.
    // this.c
    // this.firebase_manager.
    // this.proxy_content.po
    // this.proxy_content.se();
    // this.proxy_content.ab();
    // this.proxy_content.s
    console.log(this.proxy_content);
    vue_app.mount("#root");
    this.proxy_content.set_popup_progress_status("not-active");
    //
  }
}
