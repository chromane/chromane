//
import PageAuth from "./pages/PageAuth.vue";
import PageSettings from "./pages/PageSettings.vue";
import PageNotSupported from "./pages/PageNotSupported.vue";
import PageReload from "./pages/PageReload.vue";
import PagePermissions from "./pages/PagePermissions.vue";
import PageFeedback from "./pages/PageFeedback.vue";
import PageOnboarding from "./pages/PageOnboarding.vue";
import PageOffboarding from "./pages/PageOffboarding.vue";
import PageUpgrade from "./pages/PageUpgrade.vue";
import PageUpgradeSuccess from "./pages/PageUpgradeSuccess.vue";
import PageAdmin from "./pages/PageAdmin.vue";
import PageStats from "./pages/PageStats.vue";
import PageAccount from "./pages/PageAccount.vue";
//
import mdi_home from "@mdi/svg/svg/home.svg?raw";
import mdi_log_in from "@mdi/svg/svg/login-variant.svg?raw";
import mdi_log_out from "@mdi/svg/svg/logout-variant.svg?raw";
import mdi_account from "@mdi/svg/svg/account-circle.svg?raw";
import mdi_comment from "@mdi/svg/svg/comment-quote-outline.svg?raw";
import mdi_star_circle from "@mdi/svg/svg/star-circle.svg?raw";
import mdi_crown from "@mdi/svg/svg/crown.svg?raw";
import mdi_finance from "@mdi/svg/svg/finance.svg?raw";
//
//
let ext_pages = [
  {
    name: "account",
    title: "My account",
    page: PageAccount,
    icon: mdi_account,
  },
  {
    name: "feedback",
    title: "Feedback",
    page: PageFeedback,
    icon: mdi_comment,
  },
  // {
  //   name: "settings",
  //   title: "Settings",
  //   page: PageSettings,
  //   icon: mdi_home,
  // },
  {
    name: "auth",
    title: "Log in",
    page: PageAuth,
    icon: mdi_log_in,
  },
  {
    name: "not_supported",
    title: "Not supported",
    page: PageNotSupported,
    icon: mdi_home,
  },
  {
    name: "onboarding",
    title: "Onboarding",
    page: PageOnboarding,
    icon: mdi_home,
  },
  {
    name: "offboarding",
    title: "Offboarding",
    page: PageOffboarding,
    icon: mdi_home,
  },
  {
    name: "upgrade",
    title: "Upgrade",
    page: PageUpgrade,
    icon: mdi_star_circle,
  },
  {
    name: "upgrade_success",
    title: "Upgrade success",
    page: PageUpgradeSuccess,
    icon: mdi_star_circle,
  },
  {
    name: "permissions",
    title: "Permissions",
    page: PagePermissions,
    icon: mdi_home,
  },
  {
    name: "reload",
    title: "Reload",
    page: PageReload,
    icon: mdi_home,
  },
  {
    name: "admin",
    title: "Admin",
    page: PageAdmin,
    icon: mdi_crown,
  },
  {
    name: "admin_stats",
    title: "Stats",
    page: PageStats,
    icon: mdi_finance,
  },
];
let ext_pages_hash: any = {};
ext_pages.forEach((page) => {
  ext_pages_hash[page.name] = page;
});
export default ext_pages;
