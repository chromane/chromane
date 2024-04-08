//
import nodeExternals from "webpack-node-externals";
import { exec, spawn, execSync } from "child_process";
import chokidar from "chokidar";
import rimraf from "rimraf";
import path from "path";
import fs from "fs";
import fs_extra from "fs-extra";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import { VueLoaderPlugin } from "vue-loader";
import HtmlWebpackPlugin from "html-webpack-plugin";
import dirnames from "./dirnames.js";
//
export default {
  init() {
    fs_extra.copySync(
      //
      path.resolve(dirnames.prj_root, "node_modules", "chromane", "template"),
      path.resolve(dirnames.prj_root)
    );
  },
  wait: function (time) {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  },
  compile: async function (compiler) {
    return new Promise((resolve) => {
      compiler.run((err, stats) => {
        if (stats.compilation && stats.compilation.errors) {
          console.log("stats.compilation.errors");
          stats.compilation.errors.forEach((error) => {
            console.log(error);
          });
        } else {
          console.log("stats.compilation.errors", []);
        }
        console.log("app err", err);
        compiler.close((closeErr) => {
          console.log("app closeErr", closeErr);
          resolve();
        });
      });
    });
  },
  build_versions: async function () {
    //
    let versions = fs_extra.readJsonSync(dirnames.versions);
    fs_extra.ensureDirSync(path.resolve(dirnames.prj_shared, "versions"));
    fs_extra.writeFileSync(
      //
      path.resolve(dirnames.prj_shared, "versions", versions.extension + ".txt"),
      versions.frontend
    );
  },
};
