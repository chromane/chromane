//
import nodeExternals from "webpack-node-externals";
import { exec, spawn, execSync } from "child_process";
import chokidar from "chokidar";
import rimraf from "rimraf";
import zipper from "zip-local";
import path from "path";
import fs from "fs";
import fs_extra from "fs-extra";
import webpack from "webpack";
//
import dirnames from "./dirnames.js";
//
//
function compiler_callback(err, stats) {
  console.log("err", err);
  if (stats && stats.compilation && stats.compilation.errors) {
    console.log("stats.compilation.errors");
    stats.compilation.errors.forEach((error) => {
      console.log(error);
    });
  } else {
    console.log("stats.compilation.errors", []);
  }
  console.log("app err", err);
}
function backend_get_config(mode) {
  let config_json = fs_extra.readJsonSync(dirnames.config);
  let config = {
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".vue", ".raw.html", ".raw.css", ".css"],
      alias: {
        "@chromane": path.resolve(dirnames.prj_root, "node_modules", "chromane"),
        "@shared": dirnames.shared,
      },
    },
    entry: path.resolve(dirnames.prj_backend_src, "index.ts"),
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: "ts-loader",
          exclude: /node_modules/,
          options: {
            transpileOnly: true,
          },
        },
      ],
    },
    node: {
      __dirname: false,
      __filename: false,
    },
    // node-specific
    target: "node",
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    externalsPresets: {
      node: true, // in order to ignore built-in modules like path, fs, etc.
    },
    // node-specific
    output: {
      filename: "index.js",
      path: path.resolve(dirnames.root, "temp_back"),
      libraryTarget: "this", // <-- Important
      // publicPath: "./",
    },
  };
  config.plugins = [
    new webpack.DefinePlugin({
      CHROMANE_CONFIG_MODE: JSON.stringify(mode),
      CHROMANE_CONFIG_JSON: JSON.stringify(config_json),
      CHROMANE_PRJ: JSON.stringify("backend"),
    }),
  ];
  if (mode === "dev") {
    config.mode = "development";
    config.watch = true;
  } else {
    config.mode = "production";
    config.watch = false;
  }
  return config;
}
async function watch_backend() {
  let config = backend_get_config("dev");
  webpack(config, compiler_callback);
}
async function back_build() {
  let config = backend_get_config("prod");
  webpack(config, compiler_callback);
}
//
export default {
  watch: async function () {
    if (fs_extra.existsSync(dirnames.prj_backend)) {
      watch_backend();
      // watch and move package json
      let chokidar_watcher = chokidar.watch(
        [
          //
          path.resolve(dirnames.prj_backend, "package.json"),
        ],
        {
          ignoreInitial: false,
          ignored: /^\./,
          persistent: true,
        }
      );
      chokidar_watcher.on("all", async (event, event_path) => {
        console.log("MOVED PACKAGE");
        fs_extra.copySync(
          //
          path.resolve(dirnames.prj_backend, "package.json"),
          path.resolve(dirnames.root, "temp_back", "package.json")
        );
      });
      console.log("done");
    } else {
      console.log("prj_backend_not_found");
    }
  },
  build: async function () {
    if (fs_extra.existsSync(dirnames.prj_backend)) {
      back_build();
      fs_extra.copySync(
        //
        path.resolve(dirnames.prj_backend, "package.json"),
        path.resolve(dirnames.root, "temp_back", "package.json")
      );
    } else {
      console.log("prj_backend_not_found");
    }
  },
  run: async function () {
    let process = spawn(`node`, `index.js`.split(" "), {
      cwd: path.resolve(dirnames.root, "temp_back"),
      stdio: "inherit",
      shell: true,
    });
  },
  // dev: async function () {
  //   let process = spawn(`node`, `index.js`.split(" "), {
  //     cwd: path.resolve(dirnames.root, "temp_back"),
  //     stdio: "inherit",
  //     shell: true,
  //   });
  // },
};
