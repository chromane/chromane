import path from "path";
import fs from "fs";

export default {
  //
  root: "",
  prj_root: "",
  common: "",
  static: "",
  shared: "",
  config: "",
  versions: "",
  //
  prj_ext: "",
  prj_extension: "",
  prj_extension_src: "",
  extension_package: "",
  temp_extension_install: "",
  temp_extension_webpack: "",
  temp_extension_build: "",
  prj_front: "",
  prj_frontend: "",
  prj_frontend_src: "",
  temp_frontend_webpack: "",
  prj_back: "",
  prj_backend: "",
  prj_backend_src: "",
  prj_shared: "",
  //
  init(prj_root) {
    this.prj_root = prj_root;
    //
    this.common = path.resolve(this.prj_root, "common");
    this.static = path.resolve(this.prj_root, "prj_static");
    this.shared = path.resolve(this.prj_root, "prj_shared");
    this.config = path.resolve(this.prj_root, "prj_shared", "config.json");
    this.versions = path.resolve(this.prj_root, "prj_shared", "versions.json");
    //
    this.prj_front = path.resolve(this.prj_root, "prj_front");
    this.prj_ext = path.resolve(this.prj_root, "prj_ext");
    this.prj_back = path.resolve(this.prj_root, "prj_back");
    this.prj_shared = path.resolve(this.prj_root, "prj_shared");
    //
    this.temp_extension_install = path.resolve(this.prj_root, "temp_ext_install");
    this.temp_extension_webpack = path.resolve(this.prj_root, "temp_ext_webpack");
    this.temp_extension_build = path.resolve(this.prj_root, "temp_ext_build");
    this.temp_frontend_webpack = path.resolve(this.prj_root, "temp_front_vite");
    //
    this.prj_extension = path.resolve(this.prj_root, "prj_ext");
    this.prj_extension_src = path.resolve(this.prj_root, "prj_ext", "src");
    this.extension_package = path.resolve(this.prj_root, "prj_shared", "package");
    //
    this.prj_frontend = path.resolve(this.prj_root, "prj_front");
    this.prj_frontend_src = path.resolve(this.prj_root, "prj_front", "src");
    //
    this.prj_backend = path.resolve(this.prj_root, "prj_back");
    this.prj_backend_src = path.resolve(this.prj_root, "prj_backend", "src");
    //
    this.config_json = JSON.parse(fs.readFileSync(this.config, "utf8"));
  },
  config_json: {},
  //
};
