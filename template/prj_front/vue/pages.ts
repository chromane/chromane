import PageMain from "./pages/PageMain.vue";
import PageSettings from "./pages/PageSettings.vue";
import mdi_home from "@mdi/svg/svg/home.svg?raw";
import mdi_cog from "@mdi/svg/svg/cog.svg?raw";
let ext_pages = [
  {
    name: "main",
    title: "Main",
    page: PageMain,
    icon: mdi_home,
  },
  {
    name: "settings",
    title: "Settings",
    page: PageSettings,
    icon: mdi_cog,
  },
];
let ext_pages_hash: any = {};
ext_pages.forEach((page) => {
  ext_pages_hash[page.name] = page;
});
export default ext_pages;
