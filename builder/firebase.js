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
import { globSync } from "glob";
import dirnames from "./dirnames.js";
import { Storage } from "@google-cloud/storage";
//
async function move_backend_to_vm() {
  //
  console.log("move_backend_to_vm", "start");
  execSync("gcloud compute scp index.js instance-1:index.js", {
    cwd: path.resolve(dirnames.root, "temp_backend"),
    stdio: "inherit",
    shell: true,
  });
  console.log("result");
  console.log("move_backend_to_vm", "end");
  //
}
// todo: pull the service account from github secrets
// it should have permission to upload files to a public google cloud bucket
let secrets = fs_extra.readJsonSync(path.resolve(dirnames.prj_root, ".secrets.json"));
let config = fs_extra.readJsonSync(path.resolve(dirnames.prj_root, "prj_shared", "config.json"));
//
const storage = new Storage({
  credentials: secrets.service_account,
});
// this deploys hosting only
async function deploy_hosting_to_chromane_cdn(ext_name) {
  console.log("upload start");
  let bucket = storage.bucket(config.gc_public_bucket_id);
  await bucket.setCorsConfiguration([
    {
      maxAgeSeconds: 3600 * 2,
      method: ["GET"],
      origin: ["*"],
    },
  ]);
  // const storage = new storage.Storage();
  // Creates a transfer manager client
  let versions = fs_extra.readJsonSync(dirnames.versions);
  let promise_arr = [];
  // Upload files of this version
  let prefix_to_remove = path.resolve(dirnames.root, "temp_frontend_build", versions.frontend);
  let path_string_arr = globSync(path.resolve(dirnames.root, "temp_frontend_build", versions.frontend, "**/*"));
  console.log("path_string_arr", "front", path_string_arr);
  for (let path_string of path_string_arr) {
    console.log(path_string);
    if (fs.lstatSync(path_string).isDirectory()) {
      // skip
    } else {
      try {
        let destination = path_string.replace(prefix_to_remove, "");
        let promise = bucket.upload(path_string, {
          destination: `x/${ext_name}/f/${versions.frontend}${destination}`,
          metadata: {
            cacheControl: "public,max-age=31536000",
          },
        });
        promise_arr.push(promise);
      } catch (error) {
        console.log("error", error);
      }
    }
  }
  // Add version files
  prefix_to_remove = path.resolve(dirnames.prj_shared, "versions");
  path_string_arr = globSync(path.resolve(dirnames.prj_shared, "versions", "**/*"));
  console.log("path_string_arr", "versions", path_string_arr);
  for (let path_string of path_string_arr) {
    console.log(path_string);
    if (fs.lstatSync(path_string).isDirectory()) {
      // skip
    } else {
      try {
        let destination = path_string.replace(prefix_to_remove, "");
        let promise = bucket.upload(path_string, {
          destination: `x/${ext_name}/v${destination}`,
          metadata: {
            cacheControl: "public,max-age=31536000",
          },
        });
        promise_arr.push(promise);
      } catch (error) {
        console.log("error", error);
      }
    }
  }
  // Add static files
  // only if they don't exist already
  let [remote_static_files] = await bucket.getFiles({
    prefix: `x/${ext_name}/static/`,
  });
  let remote_file_names = remote_static_files.map((file) => {
    return file.name;
  });
  // console.log("remote_file_names", remote_file_names);
  prefix_to_remove = path.resolve(dirnames.prj_root, "prj_static");
  path_string_arr = globSync(path.resolve(dirnames.prj_root, "prj_static", "**/*"));
  console.log("path_string_arr", "static", path_string_arr);
  for (let path_string of path_string_arr) {
    // console.log(path_string);
    if (fs.lstatSync(path_string).isDirectory()) {
      // skip
    } else {
      try {
        let relative_file_name = path_string.replace(prefix_to_remove, "");
        let destination = `x/${ext_name}/s${relative_file_name}`;
        if (remote_file_names.includes(destination)) {
          console.log(`skip_because_exists: ${destination}`);
        } else {
          let promise = bucket.upload(path_string, {
            destination,
            metadata: {
              cacheControl: "public,max-age=31536000",
            },
          });
          promise_arr.push(promise);
        }
      } catch (error) {
        console.log("error", error);
      }
    }
  }
  //
  // Start upload
  console.log("upload start");
  await Promise.all(promise_arr);
  // console.log(results);
  console.log("upload end");
  console.log("deleting extension version files start");
  fs.rmSync(
    //
    path.resolve(dirnames.root, "temp_frontend_build", versions.frontend),
    {
      recursive: true,
      force: true,
    }
  );
  console.log("deleting extension version files end");
}
//
export default {
  upload_package: async function (ext_name, dir_name, file_name) {
    let bucket = storage.bucket(config.gc_public_bucket_id);
    console.log("upload start");
    // x/${ext_name}/p
    // x = extension
    // p = package
    // v = versions
    await bucket.upload(`${dir_name}/${file_name}`, {
      destination: `x/${ext_name}/p/${file_name}`,
    });
    console.log(`https://cdn.chromane.com/x/${ext_name}/p/${file_name}`);
    console.log("upload end");
  },
  serve: async function () {
    console.log("NOT starting firebase serve");
  },
  deploy_hosting: async function (ext_name) {
    await deploy_hosting_to_chromane_cdn(ext_name);
  },
  back_deploy: async function () {
    move_backend_to_vm();
  },
  deploy_all: async function () {
    move_backend_to_vm();
  },
};
//
