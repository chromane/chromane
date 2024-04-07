import config from "@shared/config";
import store from "./store";
import pages from "./pages";
import PrjCloudIframe from "../ts/PrjCloudIframe";
export default new PrjCloudIframe(store, config, pages);
