//
import nodeExternals from "webpack-node-externals";
import { exec, spawn, execSync } from "child_process";
import chokidar from "chokidar";
import rimraf from "rimraf";
import path from "path";
import fs from "fs";
import fs_extra from "fs-extra";
import webpack from "webpack";
import kill from "tree-kill";
//
import dirnames from "./dirnames.js";
//
let _server_process = null;
//
// function kill_process(process) {
//   return new Promise((resolve) => {
//     process.on("close", () => {
//       console.log("222New version of back created. Process with old server killed.");
//       resolve();
//     });
//     console.log("killing");
//     process.kill(process.pid, "SIGKILL");
//     resolve();
//   });
// }
async function compiler_callback(mode, err, stats) {
  console.log("err", err);
  //
  if (mode === "dev") {
    if (_server_process !== null) {
      kill(_server_process.pid);
      // _server_process.stdin.pause();
      // _server_process.kill("SIGINT");
      // console.log("killed", _server_process.killed);
      // console.log("killed", _server_process.killed);
      // console.log("killed", _server_process.killed);
      // while (_server_process.killed !== true) {
      //   console.log("killed", _server_process.killed);
      //   console.log("killed", _server_process.killed);
      //   console.log("killed", _server_process.killed);
      //   console.log("killed", _server_process.killed);
      //   console.log("killed", _server_process.killed);
      //   console.log("killed", _server_process.killed);
      //   await common.wait(100);
      // }
      // // await kill_process(_server_process);
      // process.on("close", async () => {
      //   console.log("222New version of back created. Process with old server killed.");
      // });
      // _server_process.kill("SIGINT");
      console.log("New version of back created. Process with old server killed.");
    }
    _server_process = spawn(`node`, `index.js`.split(" "), {
      cwd: path.resolve(dirnames.prj_root, "temp_back"),
      stdio: "inherit",
      shell: true,
    });
  }
  //
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
      extensions: [".ts"],
      alias: {
        "@chromane": path.resolve(dirnames.prj_root, "node_modules", "chromane"),
        "@shared": dirnames.prj_shared,
      },
    },
    entry: path.resolve(dirnames.prj_back, "entry", "index.ts"),
    module: {
      rules: [
        {
          resourceQuery: /raw/,
          type: "asset/source",
        },
        {
          test: /\.ts$/,
          loader: "ts-loader",
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
  webpack(config, (err, stats) => {
    compiler_callback("dev", err, stats);
  });
}
async function back_build() {
  let config = backend_get_config("prod");
  webpack(config, (err, stats) => {
    compiler_callback("prod", err, stats);
  });
}
function move_static_back_files() {
  console.log("MOVED PACKAGE");
  fs_extra.copySync(
    //
    path.resolve(dirnames.prj_backend, "package.json"),
    path.resolve(dirnames.root, "temp_back", "package.json")
  );
}
import common from "./common.js";
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
        move_static_back_files();
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
    move_static_back_files();
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
