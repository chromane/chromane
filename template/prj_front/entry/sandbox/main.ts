import chrome_mock from "@chromane/front/ts/chrome_mock";
chrome_mock.init(window);

import config from "@shared/config";
config.mode = "sandbox";

import PrjContent from "@root/prj_ext/ts/PrjContent";

import project_css from "@shared/slots/project.css?raw";
import project_logo_svg from "@shared/slots/logo-white.svg?raw";

let instance = new PrjContent(config, project_css, project_logo_svg);
console.log("config", config);
import proxies from "@chromane/shared/ts/proxies";

proxies.create_window_api(config.ext_id, instance, "*");
instance.init(config.urls.extension_iframe_mock);
