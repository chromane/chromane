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
import { auth, GoogleAuth } from "google-auth-library";
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

//
// this deploys hosting only
async function deploy_hosting_to_chromane_cdn(ext_name) {
  //
  let secrets = fs_extra.readJsonSync(path.resolve(dirnames.prj_root, ".secrets.json"));
  let config = fs_extra.readJsonSync(path.resolve(dirnames.prj_root, "prj_shared", "config.json"));
  const storage = new Storage({
    credentials: secrets.service_account,
  });
  //
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
          destination: `f/${versions.frontend}${destination}`,
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
          destination: `v${destination}`,
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
    prefix: `static/`,
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
        let destination = `s${relative_file_name}`;
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
    //
    let secrets = fs_extra.readJsonSync(path.resolve(dirnames.prj_root, ".secrets.json"));
    let config = fs_extra.readJsonSync(path.resolve(dirnames.prj_root, "prj_shared", "config.json"));
    const storage = new Storage({
      credentials: secrets.service_account,
    });
    //
    let bucket = storage.bucket(config.gc_public_bucket_id);
    console.log("upload start");
    // p
    // x = extension
    // p = package
    // v = versions
    await bucket.upload(`${dir_name}/${file_name}`, {
      destination: `p/${file_name}`,
    });
    console.log(`https://storage.googleapis.com/${config.gc_public_bucket_id}/p/${file_name}`);
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
  deploy: async function () {
    let secrets = fs_extra.readJsonSync(path.resolve(dirnames.prj_root, ".secrets.json"));
    let config = fs_extra.readJsonSync(path.resolve(dirnames.prj_root, "prj_shared", "config.json"));
    let gc_id = config.gc_id;
    //
    let auth = new GoogleAuth({
      credentials: secrets.google_service_account,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      // scopes: ["*"],
    });
    let token = await auth.getAccessToken();
    let service_name = `projects/${config.gc_id}/locations/${"us-central1"}/services/${"back"}`;
    let url = `https://run.googleapis.com/v2/${service_name}`;
    console.log("token", token);
    //
    // STEP 1
    // sudo docker build --output ./ --network host -f dockerfile ./ -t back:1.0
    // STEP 2
    // sudo docker images -a
    // STEP 3
    // sudo docker tag ${docker_image_id} us-central1-docker.pkg.dev/${gc_id}/back/image1:tag1
    //
    //
    // STEP 2
    // execSync(
    //   // `docker login -u '${secrets.google_service_account.client_email}' -p '${token}' https://us-central1-docker.pkg.dev/${gc_id}/back/image1`,
    //   // `docker login -u ${secrets.google_service_account.client_email} -p ${token} https://us-central1-docker.pkg.dev/${gc_id}/back/image1`,
    //   `sudo docker login -u _json_key_base64 -p ${btoa(
    //     JSON.stringify(secrets.google_service_account)
    //   )} https://us-central1-docker.pkg.dev/${gc_id}/back/image1`,
    //   {
    //     // execSync(`docker login -u _user -p ${token}`, {
    //     cwd: path.resolve(dirnames.prj_root, "temp_backend"),
    //     stdio: "inherit",
    //     shell: true,
    //   }
    // );
    //
    // STEP 4
    // execSync(
    //   // `docker login -u '${secrets.google_service_account.client_email}' -p '${token}' https://us-central1-docker.pkg.dev/${gc_id}/back/image1`,
    //   // `docker login -u ${secrets.google_service_account.client_email} -p ${token} https://us-central1-docker.pkg.dev/${gc_id}/back/image1`,
    //   `sudo docker tag 699d8457ef6a us-central1-docker.pkg.dev/${gc_id}/back/image1:tag1`,
    //   {
    //     // execSync(`docker login -u _user -p ${token}`, {
    //     cwd: path.resolve(dirnames.prj_root, "temp_backend"),
    //     stdio: "inherit",
    //     shell: true,
    //   }
    // );
    //
    // STEP 4
    let r = await fetch(url, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        // template: { containers: [{ image: "us-docker.pkg.dev/cloudrun/container/hello:latest" }] },
        template: { containers: [{ image: `us-central1-docker.pkg.dev/${gc_id}/back/image1:tag5` }] },
      }),
    });
    // let text = await r.text();
    // console.log("text", text);
    // const runClient = new cloud_run.v2.ServicesClient();
    // await runClient.initialize({});
    // let result = await runClient.updateService({
    //   service: {
    //     name: "back",
    //   },
    // });
    // console.log("result", result);
  },
};
//
