import chokidar from "chokidar";
import path from "path";
import fs_extra from "fs-extra";

let source = path.resolve("../chromane");
let destinations = [
  //
  path.resolve("../link_spotter/node_modules/chromane"),
  path.resolve("../swift/node_modules/chromane"),
];

console.log(source);
console.log(destinations);

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
    for (let destination of destinations) {
      fs_extra.copySync(
        //
        path.resolve(source, folder),
        path.resolve(destination, folder)
      );
    }
  }
}
chokidar_watcher.on("change", async (event, event_path) => {
  console.log("change");
  copy();
  for (let destination of destinations) {
    fs_extra.removeSync(path.resolve(destination, "..", ".vite", "deps"));
  }
});
copy();
