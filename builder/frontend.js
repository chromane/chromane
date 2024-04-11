//
import path from "path";
import fs from "fs";
import fs_extra from "fs-extra";
import vite_vue from "@vitejs/plugin-vue";
import dirnames from "./dirnames.js";
//
import tsconfigPaths from "vite-tsconfig-paths";
//
import * as vite from "vite";
import * as tailwindcss from "tailwindcss";
import * as autoprefixer from "autoprefixer";
//
function get_rollup_input_obj() {
  let obj = {};
  let names = fs.readdirSync(path.resolve(dirnames.prj_root, "prj_front", "entry"));
  for (let name of names) {
    console.log("name", name);
    obj[name] = path.resolve(dirnames.prj_root, "prj_front", "entry", name, "index.html");
  }
  return obj;
}
function get_config(mode, version_frontend) {
  let config_json = fs_extra.readJsonSync(dirnames.config);
  return {
    optimizeDeps: {
      exclude: ["@chromane", "chromane"],
    },
    define: {
      CHROMANE_CONFIG_MODE: JSON.stringify(mode),
      CHROMANE_CONFIG_JSON: JSON.stringify(config_json),
    },
    css: {
      postcss: {
        plugins: [
          //
          tailwindcss.default(path.resolve(dirnames.prj_root, "./tailwind.config.cjs")),
          autoprefixer.default,
        ],
      },
    },
    plugins: [
      // https://github.com/vitejs/vite/issues/4533
      // {
      //   name: "noCache",
      //   configureServer(server) {
      //     server.middlewares.use((req, res, next) => {
      //       console.log(req.url);
      //       // if (
      //       //   req.url?.includes("/node_modules/chromane/") === true &&
      //       //   req.url.includes("env.mjs" === false)
      //       // ) {
      //       //   // Bypass vite's file cache - modifies ?v=... parameter
      //       //   req.url += Date.now();
      //       //   // Bypass browser cache - those headers override "Cache-control" added by Vite
      //       //   res.setHeader("Expires", "0");
      //       //   res.setHeader("Pragma", "no-cache");
      //       // }
      //       next();
      //     });
      //   },
      // },
      //
      vite_vue(),
      // tsconfigPaths({
      //   loose: true,
      //   // allowJs: true,
      //   // root: dirnames.prj_root,
      //   projects: [
      //     //
      //     path.resolve(dirnames.prj_root, "node_modules", "chromane", "front"),
      //     path.resolve(dirnames.prj_root, "node_modules", "chromane", "shared"),
      //     //
      //     dirnames.prj_back,
      //     dirnames.prj_shared,
      //     dirnames.prj_front,
      //     dirnames.prj_ext,
      //   ],
      // }),
    ],
    configFile: false,
    // root: dirnames.root, // path.resolve(dirnames.prj_root, "entry_front"),
    root: path.resolve(dirnames.prj_root, "prj_front", "entry"),
    publicDir: mode === "dev" ? path.resolve(dirnames.prj_root) : "public",
    hmr: false,
    build: {
      rollupOptions: {
        input: get_rollup_input_obj(),
      },
      outDir: path.resolve(dirnames.root, "temp_frontend_build", version_frontend),
    },
    base: "",
    resolve: {
      preserveSymlinks: true,
      alias: [
        // "@chromane": "chromane",
        // "@common": dirnames.common,
        // "@shared": dirnames.shared,
        { find: "@root", replacement: dirnames.prj_root },
        { find: "@common", replacement: dirnames.common },
        { find: "@shared", replacement: dirnames.shared },
        { find: "@chromane", replacement: path.resolve(dirnames.prj_root, "node_modules", "chromane") },
        // { find: "@chromane", replacement: "chromane" },
        // "@chromane": path.resolve(dirnames.prj_root, "node_modules", "chromane"),
      ],
    },
    server: {
      port: 2140,
    },
  };
}
export default {
  watch: async function () {
    let versions = fs_extra.readJsonSync(dirnames.versions);
    let version_frontend = versions.frontend;
    //
    let config = get_config("dev", version_frontend);
    let server = await vite.createServer(config);
    await server.listen();
    server.printUrls();
  },
  build: async function () {
    let versions = fs_extra.readJsonSync(dirnames.prj_root);
    let version_frontend = versions.frontend;
    //
    let config = get_config("prod", version_frontend);
    vite.build(config);
    // build_frontend();
  },
};
