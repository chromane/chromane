//
import chokidar from "chokidar";
import rimraf from "rimraf";
import path from "path";
import archiver from "archiver";
import fs_extra from "fs-extra";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import { VueLoaderPlugin } from "vue-loader";
import HtmlWebpackPlugin from "html-webpack-plugin";
import fs from "fs";
import sharp from "sharp";
//
import dirnames from "./dirnames.js";
import common from "./common.js";
import firebase from "./firebase.js";
//
let _pr = path.resolve;
//
function get_webpack_config(mode) {
  //
  let config_json = fs_extra.readJsonSync(dirnames.config);
  //
  try {
    var names_ts = fs.readdirSync(_pr(dirnames.prj_root, "prj_ext", "entry", "ts")).map((name) => {
      return name.replace(".ts", "");
    });
  } catch (e) {
    var names_ts = [];
  }
  let names_pages = fs.readdirSync(_pr(dirnames.prj_root, "prj_ext", "entry", "pages"));
  //
  console.log("js", names_ts);
  console.log("pages", names_pages);
  //
  let webpack_data;
  let webpack_dev = {
    devtool: "inline-source-map",
    optimization: {
      minimize: false,
    },
  };
  let webpack_prod = {
    devtool: false,
    optimization: {
      minimize: true,
    },
  };
  if (mode === "prod") {
    webpack_data = webpack_prod;
    webpack_data.mode = "production";
  } else if (mode === "dev") {
    webpack_data = webpack_dev;
    webpack_data.mode = "development";
    webpack_data.cache = { type: "memory" };
  } else {
    return null;
  }
  webpack_data.resolve = {
    extensions: [".ts", ".tsx", ".js", ".vue", ".raw.html", ".raw.css", ".css"],
    alias: {
      "@chromane": path.resolve(dirnames.prj_root, "node_modules", "chromane"),
      "@shared": dirnames.prj_shared,
    },
  };
  webpack_data.module = {
    rules: [
      {
        test: /\.svg$/,
        loader: "svg-inline-loader",
      },
      {
        test: /\.svg\?raw$/,
        loader: "svg-inline-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        exclude: /\.raw\./,
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
        exclude: /\.raw\./,
      },
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /(\.raw\.)/,
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        exclude: /\.raw\./,
      },
      {
        test: /\.html$/,
        exclude: /\.raw\./,
        use: {
          loader: "html-loader",
          options: {
            sources: {
              list: [
                {
                  // Attribute name
                  attribute: "src",
                  // Type of processing, can be `src` or `scrset`
                  type: "src",
                  // Allow to filter some attributes (optional)
                  filter: (tag, attribute, attributes, resourcePath) => {
                    // choose all HTML tags except img tag
                    if (tag.toLowerCase() === "script") {
                      return false;
                    } else if (tag.toLowerCase() === "img") {
                      return false;
                    } else if (tag.toLowerCase() === "iframe") {
                      return false;
                    } else {
                      return true;
                    }
                  },
                },
              ],
            },
          },
        },
      },
      {
        test: /\.txt$/i,
        use: "raw-loader",
      },
      {
        test: /\.groovy$/i,
        use: "raw-loader",
      },
      {
        test: /\.raw\.css$/,
        use: "raw-loader",
      },
      {
        test: /\.raw\.css\?raw$/,
        use: "raw-loader",
      },
      {
        test: /\.raw\.html$/,
        use: "raw-loader",
      },
      {
        test: /\.raw\.html\?raw$/,
        use: "raw-loader",
      },
    ],
  };
  let entry = {};
  names_pages.forEach((name) => {
    entry[name] = [_pr(dirnames.prj_ext, "entry", "pages", name, `main.ts`)];
  });
  names_ts.forEach((name) => {
    entry[name] = [_pr(dirnames.prj_ext, "entry", "ts", `${name}.ts`)];
  });
  webpack_data.entry = entry;
  webpack_data.output = {
    filename: "[name].js",
  };
  webpack_data.plugins = [
    new webpack.DefinePlugin({
      CHROMANE_CONFIG_MODE: JSON.stringify(mode),
      CHROMANE_CONFIG_JSON: JSON.stringify(config_json),
      CHROMANE_PRJ: JSON.stringify("extension"),
    }),
    ...names_pages.map((name) => {
      return new HtmlWebpackPlugin({
        template: _pr(dirnames.prj_ext, "entry", "pages", name, `index.html`),
        filename: `./${name}/index.html`,
        chunks: [name],
      });
    }),
  ];
  return webpack_data;
}
async function create_dev_server() {
  let config = get_webpack_config("dev");
  console.log("entry", config.entry);

  fs_extra.ensureDirSync(dirnames.temp_extension_webpack);

  config.output = {
    filename: "[name].js",
    path: dirnames.temp_extension_webpack + "/",
    publicPath: "./",
  };

  let compiler = webpack(config);
  let last_compilation_fullhash = "";

  compiler.hooks.afterEmit.tap("tapping", async (compilation) => {
    console.log("afterEmit");
    console.log("compilation", compilation.fullHash);
    if (last_compilation_fullhash !== compilation.fullHash) {
      last_compilation_fullhash = compilation.fullHash;
      try {
        await copy_from_temp_to_extension("dev");
      } catch (e) {
        console.log("error", e);
      }
    }
  });

  compiler.hooks.afterCompile.tap("test", () => {
    console.log("afterCompile");
  });

  const devServerOptions = {
    devMiddleware: {
      writeToDisk: true,
      // path: root_path + "/dev_server/public",
    },
    magicHtml: false,
    webSocketServer: false,
    client: false,
    hot: false,
    liveReload: false,
    // inline: false,
    // injectClient: false,
    port: 2130,
    // don't open http://localhost:2130/ automatically on dev server start
    open: false,
    static: {
      directory: dirnames.temp_extension_webpack + "/",
    },
  };

  const server = new WebpackDevServer(devServerOptions, compiler);

  console.log("Starting server...");
  await server.start();

  return server;
}
async function build_webpack() {
  // ensure
  rimraf.sync(dirnames.temp_extension_webpack);
  // build extension
  let config = get_webpack_config("prod");
  config.output = {
    filename: "[name].js",
    path: dirnames.temp_extension_webpack + "/",
    publicPath: "./",
  };
  fs_extra.ensureDirSync(config.output.path);
  let compiler = webpack(config);
  await common.compile(compiler);
}
async function copy_from_temp_to_extension(mode) {
  //
  let temp = dirnames.temp_extension_webpack;
  let path_src = _pr(dirnames.prj_root);
  let path_temp = _pr(dirnames.temp_extension_install);
  // clean temp_extension_install
  rimraf.sync(path_temp);
  // copy raw /src/extension folder into installable /extension
  fs_extra.copySync(_pr(dirnames.prj_shared, "package"), path_temp);
  //
  let versions = fs_extra.readJsonSync(dirnames.versions);
  // todo: add name and description name verification
  let manifest = fs_extra.readJsonSync(_pr(path_temp, "manifest.json"));
  manifest.version = versions.extension;
  // add "key" to manifest.json, but only in dev mode
  if (mode === "dev" || mode === "prod") {
    let config = fs_extra.readJsonSync(dirnames.config);
    manifest.key = config.key;
  } else if (mode === "prod-no-key") {
    // do not add "key" to manifest
    // chrome webstore rejects extensions with "key" in "manifest.json"
  }
  fs_extra.writeJsonSync(_pr(path_temp, "manifest.json"), manifest);
  try {
    var names_ts = fs.readdirSync(_pr(dirnames.prj_ext, "entry", "ts")).map((name) => {
      return name.replace(".ts", "");
    });
  } catch (e) {
    var names_ts = [];
  }
  let names_pages = fs.readdirSync(_pr(dirnames.prj_ext, "entry", "pages"));
  // move all found pages
  names_pages.forEach((name) => {
    if (fs_extra.existsSync(`${temp}/${name}/index.html`)) {
      fs_extra.copySync(`${temp}/${name}/index.html`, `${path_temp}/pages/${name}/index.html`);
      fs_extra.copySync(`${temp}/${name}.js`, `${path_temp}/pages/${name}/${name}.js`);
    }
  });
  // move all found scripts
  names_ts.forEach((name) => {
    if (fs_extra.existsSync(`${temp}/${name}.js`)) {
      fs_extra.copySync(`${temp}/${name}.js`, `${path_temp}/js/${name}.js`);
    }
  });
}
//
async function build_logos() {
  let path_to_logo = _pr(dirnames.prj_shared, "slots", "logo-extension.svg");
  if (fs_extra.existsSync(path_to_logo)) {
    let path_to_result_1 = _pr(dirnames.prj_shared, "package", "img", "logo-128.png");
    fs_extra.ensureDirSync(_pr(dirnames.prj_shared, "package", "img"));
    await sharp(path_to_logo).resize(128, 128).png().toFile(path_to_result_1);
  }
}
function zip_dir(input_dir, output_dir, output_file) {
  return new Promise((resolve) => {
    fs_extra.ensureDirSync(output_dir);

    var output = file_system.createWriteStream(path.resolve(output_dir, output_file));
    var archive = archiver("zip");

    output.on("close", function () {
      console.log(output_file);
      console.log(archive.pointer() + " total bytes");
      console.log("archiver has been finalized and the output file descriptor has closed.");
      resolve(true);
    });

    archive.on("error", function (err) {
      console.log("archiver error", err);
      resolve(false);
    });

    archive.pipe(output);

    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory(input_dir, false);

    // append files from a sub-directory and naming it `new-subdir` within the archive
    archive.directory("subdir/", "new-subdir");

    archive.finalize();
  });
}
//
export default {
  watch: async function () {
    //
    build_logos();
    let watchers = {
      chokidar_watcher: null,
      webpack_watcher: null,
      dev_server: null,
      dev_servers: [],
    };
    // try {
    //   watchers.dev_servers = await create_webpack_dev_servers(
    //     root_path,
    //     destination
    //   );
    // } catch (e) {
    //   console.log("Failed to start dev server");
    //   console.log(e);
    // }
    try {
      var server = await create_dev_server();
      watchers.dev_servers.push(server);
    } catch (e) {
      console.log("Failed to start dev server");
      console.log(e);
    }
    //
    // watchers.chokidar_watcher = chokidar.watch([`${root_path}/src/extension`], {
    //   ignoreInitial: true,
    //   ignored: /^\./,
    //   persistent: true,
    // });
    // watchers.chokidar_watcher.on("all", async (event, path) => {
    //   copy_from_temp_to_extension("dev");
    // });
    return watchers;
  },
  build: async function () {
    await build_logos();
    //
    let config = fs_extra.readJsonSync(dirnames.config);
    let versions = fs_extra.readJsonSync(dirnames.versions);
    let ext_name = config.ext_name;
    //
    await build_webpack();
    rimraf.sync(`${dirnames.temp_extension_build}`);
    fs_extra.ensureDirSync(dirnames.temp_extension_build);
    //
    await copy_from_temp_to_extension("prod-no-key");
    let package_no_key_name = `${ext_name}-no-key-${versions.extension}.zip`;
    await zip_dir(dirnames.temp_extension_install, dirnames.temp_extension_build, package_no_key_name);
    //
    await copy_from_temp_to_extension("prod");
    let package_key_name = `${config.ext_name}-${versions.extension}.zip`;
    await zip_dir(dirnames.temp_extension_install, dirnames.temp_extension_build, package_key_name);
    //
    console.log("build complete");
    //
    console.log("upload start");
    await firebase.upload_package(ext_name, dirnames.temp_extension_build, package_no_key_name);
    await firebase.upload_package(ext_name, dirnames.temp_extension_build, package_key_name);
    console.log("upload end");
    //
    console.log("frontent deploy start");
    await firebase.deploy_hosting(ext_name);
    console.log("frontent deploy end");
    //
  },
};
