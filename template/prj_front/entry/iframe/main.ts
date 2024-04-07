import "tailwindcss/tailwind.css";
import "@shared/slots/project.css";

// vue app
import App from "../../vue/App.vue";
import { createApp } from "vue";

const app_vue = createApp(App);
// tippy
import VueTippy from "vue-tippy";
import "tippy.js/dist/tippy.css"; // optional for styling
app_vue.use(VueTippy, {
  directive: "tippy", // => v-tippy
});
//
import config from "@shared/config";
import ctrl from "../../vue/ctrl";
import proxies from "chromane/shared/ts/proxies";

proxies.create_window_api(config.ext_id, ctrl, "*");
ctrl.init(app_vue);
// register_iframe
let message = {
  name: "register_iframe",
  data: {
    iframe_name: "firebase_iframe",
    extension_id: config.extension_id,
  },
};
window.parent.postMessage(message, "*");
window.parent.parent.postMessage(message, "*");
