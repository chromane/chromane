import config from "@shared/config";

import PrjContent from "../../ts/PrjContent";
// import project_css from "@shared/slots/project.raw.css?raw";

import project_css from "@shared/slots/project.raw.css?raw";
import project_logo_svg from "@shared/slots/logo-white.svg?raw";

let instance = new PrjContent(config, project_css, project_logo_svg);
console.log("config", config);
import proxies from "chromane/shared/ts/proxies";

proxies.create_window_api(config.ext_id, instance, "*");
instance.init(config.urls.extension_iframe);
