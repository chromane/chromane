let config = { mode: "prod" };

class Log {
  config: any;
  constructor(config) {
    this.config = config;
  }
  write(...args: any[]) {
    if (this.config.mode !== "prod") {
      console.log(...args);
    }
  }
  write_store_change(key, v_new, v_old) {
    if (config.mode !== "prod") {
      let log_color = "#6d6ded";
      console.groupCollapsed(`%c store.${key}`, `color: ${log_color}`);
      console.log("old:", v_old);
      console.log("new:", v_new);
      console.groupEnd();
    }
  }
  write_method_call({ obj, class_name, method_name, args, output, error, stub, stack, ignore }) {
    if (!ignore && this.config.mode !== "prod") {
      let log_color = "eggshell";
      if (stub) {
        log_color = "yellow";
      } else if (error) {
        log_color = "red";
      } else if (class_name.endsWith("Fake")) {
        log_color = "orange";
      } else {
        log_color = "white";
      }

      let name = class_name + "." + method_name;

      if (this.mute_arr.includes(name)) {
        return;
      }

      console.groupCollapsed("%c " + class_name + "." + method_name, `color: ${log_color}`);
      // console.group("%c " + class_name + "." + method_name, `color: ${log_color}`);
      console.log("this:");
      console.log(obj);
      console.log("input:");
      for (var i = 0; i < args.length; i++) {
        console.log(args[i]);
      }
      console.log(args);
      console.log("output:");
      console.log(output);

      if (error) {
        console.log(stack);
      }

      console.groupEnd();
    }
  }
  mute_arr: string[] = [];
  mute(arr) {
    this.mute_arr = arr;
  }
}

export default new Log(config);
