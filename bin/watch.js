import chokidar from "chokidar";
import path from "path";
import fs_extra from "fs-extra";

let source = path.resolve("../chromane");
// let destination = path.resolve("../upwage/node_modules/chromane");
let destination = path.resolve("../link_spotter/node_modules/chromane");

console.log(source);
console.log(destination);

let folders = [
  //
  "back",
  "bin",
  "builder",
  "ext",
  "front",
  "shared",
];

let chokidar_watcher = chokidar.watch(
  folders.map((folder) => path.resolve(source, folder)),
  {
    ignoreInitial: false,
    ignored: /^\./,
    persistent: true,
  }
);

function copy() {
  console.log("copy");
  for (let folder of folders) {
    fs_extra.copySync(
      //
      path.resolve(source, folder),
      path.resolve(destination, folder)
    );
  }
}
chokidar_watcher.on("change", async (event, event_path) => {
  console.log("change");
  copy();
  fs_extra.removeSync(path.resolve(destination, "..", ".vite", "deps"));
});
copy();
