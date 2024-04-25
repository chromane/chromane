export type TypedFunction<Args extends any[] = any[], Resp = any, isPromise extends boolean = false> = (
  ...args: Args
) => isPromise extends true ? Promise<Resp> : Resp;
export type Class<Args extends string[] = string[], Result = unknown> = { new (...args: Args): Result };
export type InstanceClass<T extends Class> = InstanceType<T>;
export type Func<Args extends string[] = string[], Result = unknown> = (...args: Args) => Result;

export type RequestMethods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
export interface GET_RequestInit extends RequestInit {
  method: "GET";
  body?: null;
}
export interface Any_RequestInit extends RequestInit {
  method: "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";
}

export type IDateArguments = number | string | Date;
export type NonUndefined<T> = T extends undefined ? never : T;

export interface TUnit<T> {
  name: T;
  shortName: T;
  multiplier: number;
}
export interface IDimensions {
  L?: number;
  W?: number;
  H?: number;
}

export type TUnits<T extends string> = {
  [key in T]?: TUnit<T>;
};

export type TWeight = (typeof Util.weightDictionary)[keyof typeof Util.weightDictionary][number];
export type TShortWeight = TUnits<TWeight>;

export type TDimension = (typeof Util.DimensionDictionary)[keyof typeof Util.DimensionDictionary][number];
export type TShortDimension = TUnits<TDimension>;

import log from "./log";

class Util {
  debounce_calls: any = {};
  static weightDictionary = {
    mg: ["mg", "milligram", "milligrams"],
    g: ["g", "gram", "grams"],
    kg: ["kg", "kilogram", "kilograms"],
    oz: ["oz", "ounce", "ounces"],
    lb: ["lb", "pound", "pounds"],
    ton: ["ton", "tons", "t", "tonne", "tonnes"],
  } as const;

  static DimensionDictionary = {
    mm: ["mm", "millimeter", "millimeters"],
    cm: ["cm", "centimeter", "centimeters"],
    m: ["m", "meter", "meters"],
    km: ["km", "kilometer", "kilometers"],
    in: ["in", "inch", "inches"],
    ft: ["ft", "foot", "feet"],
    yd: ["yd", "yard", "yards"],
    mi: ["mi", "mile", "miles"],
  } as const;

  static WeightUnits: TShortWeight = {
    mg: { name: "milligram", shortName: "mg", multiplier: 0.001 },
    g: { name: "gram", shortName: "g", multiplier: 1 },
    kg: { name: "kilogram", shortName: "kg", multiplier: 1000 },
    oz: { name: "ounce", shortName: "oz", multiplier: 28.3495 },
    lb: { name: "pound", shortName: "lb", multiplier: 453.592 },
    ton: { name: "ton", shortName: "ton", multiplier: 1000000 },
  };

  static DimensionUnits: TShortDimension = {
    mm: { name: "millimeter", shortName: "mm", multiplier: 0.1 },
    cm: { name: "centimeter", shortName: "cm", multiplier: 1 },
    m: { name: "meter", shortName: "m", multiplier: 100 },
    km: { name: "kilometer", shortName: "km", multiplier: 100000 },
    in: { name: "inch", shortName: "in", multiplier: 2.54 },
    ft: { name: "foot", shortName: "ft", multiplier: 30.48 },
    yd: { name: "yard", shortName: "yd", multiplier: 91.44 },
    mi: { name: "mile", shortName: "mi", multiplier: 160934 },
  };

  static stubs: {
    output: string;
    class_name: string;
    method_name: string;
  }[] = [];
  static time = {
    get second() {
      return 1000;
    },
    get minute() {
      return 60 * this.second;
    },
    get hour() {
      return 60 * this.minute;
    },
    get day() {
      return 24 * this.hour;
    },
    get week() {
      return 7 * this.day;
    },
    get month() {
      return 30 * this.day;
    },
    get year() {
      return 365 * this.day;
    },
  } as const;

  countWords(str: string): number {
    const trimmedStr = str.trim();
    if (trimmedStr === "") return 0;
    const words = trimmedStr.split(/\s+/);
    return words.length;
  }

  distance(dx: number, dy: number) {
    return Math.sqrt(dx * dx + dy * dy);
  }

  get_scrollbar_width() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  getQueryParams(params: object) {
    if (!params) return "";
    return (
      "?" +
      Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join("&")
    );
  }

  get_params_string(params: string | string[][] | Record<string, string> | URLSearchParams | undefined) {
    return params ? "?" + new URLSearchParams(params) : "";
  }

  get_search_params<T>(search: string) {
    const searchParams = new URLSearchParams(search);
    const params = [...searchParams.entries()].reduce((acc: T, [key, value]: [string, any]) => {
      return { ...acc, [key]: isNaN(+value) ? value : +value };
    }, {} as T);
    return params;
  }

  getCookie(name: string): string {
    const escape = (s: string) => s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, "\\$1");
    const match = document.cookie.match(RegExp("(?:^|;\\s*)" + escape(name) + "=([^;]*)"));
    return match?.[1] ? match[1] : "";
  }

  updateObjectByKey = <T>(obj1: T, obj2: T, searchKey: string) => {
    if (!(obj1 instanceof Object)) return obj2;
    if (!(obj2 instanceof Object)) return obj1;
    Object.keys(obj2).forEach((key: string) => {
      if (key === searchKey) {
        obj1[key] = obj2[key];
      } else if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
        obj1[key] = this.updateObjectByKey(obj1[key], obj2[key], searchKey);
      }
    });
    return obj1;
  };

  updateObject = <T>(obj1: T, obj2: any): T => {
    if (!(obj1 instanceof Object)) return obj2 as T;
    if (!(obj2 instanceof Object)) return obj1;
    Object.keys(obj2).forEach((key: string) => {
      if (obj1[key] === null || typeof obj1[key] === "undefined") {
        obj1[key] = obj2[key];
      } else if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
        obj1[key] = this.updateObject(obj1[key], obj2[key]);
      }
    });
    return obj1;
  };

  get_current_tab_id() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          resolve(tabs[0].id);
        } else {
          resolve(null);
        }
      });
    });
  }

  async storage_clear(): Promise<void> {
    if (!chrome.storage) throw new Error("chrome.storage is not defined");
    return chrome.storage.local.clear();
  }

  async tab_reload(tabId: number): Promise<void> {
    if (!chrome.tabs) throw new Error("chrome.tabs is not defined");
    return chrome.tabs.reload(tabId);
  }

  async tabs_reload(): Promise<void> {
    if (!chrome.tabs) throw new Error("chrome.tabs is not defined");
    return chrome.tabs.reload();
  }

  async tabs_create(data: chrome.tabs.CreateProperties): Promise<chrome.tabs.Tab> {
    if (!chrome.tabs) throw new Error("chrome.tabs is not defined");
    return chrome.tabs.create(data);
  }

  async tabs_query(data: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
    if (!chrome.tabs) throw new Error("chrome.tabs is not defined");
    return chrome.tabs.query(data);
  }

  async debounce(name: string, delay: number, callback: Function) {
    let initial_ts = Date.now();
    this.debounce_calls[name] = initial_ts;
    await this.wait(delay);
    if (this.debounce_calls[name] === initial_ts) {
      callback();
    }
  }

  // !NOT FINISHED
  detect_changes(target: HTMLElement, interval: number, callback: Function) {
    let last_change_ts = 0;
    let observer = new MutationObserver(() => {
      let now_ts = Date.now();
      if (now_ts - last_change_ts > interval) {
      }
      last_change_ts = Date.now();
    });
    observer.observe(target, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    setInterval(() => {}, interval);
    callback();
  }

  async wait(time: number) {
    return new Promise((resolve: Function) => {
      setTimeout(resolve, time);
    });
  }

  decode_json<T>(text: string | null): T | null {
    if (text === null) return null;
    try {
      return JSON.parse(text) as T;
    } catch (e) {
      return null;
    }
  }

  encode_json(json: object): string {
    return JSON.stringify(json);
  }

  clone<T>(obj: T): T | null {
    try {
      return JSON.parse(JSON.stringify(obj)) as T;
    } catch (e) {
      return null;
    }
  }

  unProxyObject<T extends object>(obj: T): T {
    return Object.assign({}, obj) as T;
  }

  url_to_img(url: string): Promise<HTMLElement> {
    return new Promise(function (resolve: (value: HTMLElement) => void) {
      var img = document.createElement("img");
      img.onload = function () {
        resolve(img);
      };
      img.src = url;
    });
  }

  list_is_empty(list: any[]): boolean {
    return list.length === 0;
  }

  object_is_empty(object: object) {
    return Object.keys(object).length === 0;
  }

  async fetch_json<ResponseRes, ErrorRes>(url: RequestInfo | URL, init?: GET_RequestInit): Promise<ResponseRes | ErrorRes | null>;
  async fetch_json<ResponseRes, ErrorRes>(url: RequestInfo | URL, init?: Any_RequestInit): Promise<ResponseRes | ErrorRes | null>;
  async fetch_json<ResponseRes, ErrorRes>(url: RequestInfo | URL, init?: RequestInit): Promise<ResponseRes | ErrorRes | null> {
    return await fetch(url, init)
      .then((res: Response) => res.json() as Promise<ResponseRes>)
      .catch((res: Response) => {
        try {
          return res.json() as Promise<ErrorRes>;
        } catch (error) {
          return null;
        }
      });
  }

  async fetch_text(url: RequestInfo | URL, init?: GET_RequestInit): Promise<string | null>;
  async fetch_text(url: RequestInfo | URL, init?: Any_RequestInit): Promise<string | null>;
  async fetch_text(url: RequestInfo | URL, init?: RequestInit): Promise<string | null> {
    return await fetch(url, init)
      .then((res: Response) => res.text())
      .catch((res: Response) => res.text() || null);
  }

  async fetch_blob(url: RequestInfo | URL, init?: GET_RequestInit): Promise<Blob>;
  async fetch_blob(url: RequestInfo | URL, init?: Any_RequestInit): Promise<Blob>;
  async fetch_blob(url: RequestInfo | URL, init?: RequestInit): Promise<Blob> {
    const res = await fetch(url, init);
    return await res.blob();
  }

  async wait_for_ready_state_complete() {
    while (true) {
      if (document.readyState === "complete") {
        return;
      } else {
        await this.wait(200);
      }
    }
  }

  async wait_for_element_with_text(selector, text) {
    text = text.trim().toLowerCase();
    for (let i = 0; i < 1000; i++) {
      let element_arr = document.querySelectorAll(selector);
      for (let element of element_arr) {
        if (element.innerText.trim().toLocaleLowerCase() === text) {
          return element;
        }
      }
      await this.wait(100);
    }
  }

  simulate(element: HTMLElement, event_name: string) {
    element.dispatchEvent(new Event(event_name, { bubbles: true }));
  }

  stop_propagation_smart(e: any): void {
    e.stopPropagation();
    if (document.body) {
      this.simulate(document.body, "click");
    }
  }

  html_to_doc(html) {
    let parser = new DOMParser();
    return parser.parseFromString(html, "text/html");
  }
  html_to_element(html: string) {
    let div = document.createElement("div");
    div.innerHTML = html;
    return div.firstElementChild as HTMLElement;
  }

  bg_fetch<T>(url: string, data: any): Promise<T> {
    return new Promise<T>((resolve: (value: T) => void) => {
      chrome.runtime.sendMessage({ name: "fetch_json", data: { url, data } }, (result: T) => {
        resolve(result);
      });
    });
  }

  //
  isClass(Class: any): boolean {
    return typeof Class === "function" && /^\s*class\s+/.test(Class.toString());
  }

  // runtime api ( background )
  create_runtime_api<Args extends string[] = string[], Result = any>(
    methods: Record<string, Func<Args, Result>> | InstanceClass<Class<string[], Result>>
  ) {
    chrome.runtime.onMessage.addListener(function (
      message: {
        name: string;
        data: {
          _sender: boolean | chrome.runtime.MessageSender;
        };
      },
      sender: chrome.runtime.MessageSender,
      callback: Function
    ) {
      if (methods[message.name]) {
        if (message.data && message.data._sender) {
          message.data._sender = sender;
        }
        try {
          let promise = methods[message.name](message.data);
          if (promise && promise.then) {
            promise.then(callback).catch(() => {
              callback(null);
            });
          } else {
            callback(promise);
          }
        } catch (e) {
          callback(null);
        }
      } else {
        callback(null);
      }
      return true;
    });
  }

  tab_exec<T>(tab_id: number, name: string, data?: any): Promise<T | null> {
    if (!chrome.tabs) throw new Error("chrome.tabs is not defined");
    return new Promise((resolve: (value: T | PromiseLike<T | null> | null) => void) => {
      chrome.tabs.sendMessage(tab_id, { name, data }, function (response: T) {
        if (chrome.runtime.lastError) {
          resolve(null);
        } else {
          resolve(response);
        }
      });
    });
  }

  async current_tab_exec<T>(name: string, data?: any): Promise<T | null> {
    if (!chrome.tabs) throw new Error("chrome.tabs is not defined");
    if (!chrome.runtime) throw new Error("chrome.runtime is not defined");
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return null;
    return this.tab_exec<T>(tab.id, name, data);
  }

  parse_rows(rows) {
    let data_arr: any[] = [];
    let data = {};
    // assume that the first row defines the property names of each object
    let property_name_arr = rows[0];
    for (let i = 1; i < rows.length; i++) {
      data = {};
      for (let j = 0; j < property_name_arr.length; j++) {
        data[property_name_arr[j]] = rows[i][j];
      }
      data_arr.push(data);
    }
    return data_arr;
  }

  get_methods(obj: object) {
    return Object.getOwnPropertyNames(obj).filter((item) => {
      try {
        return typeof obj[item] === "function";
      } catch (e) {
        return false;
      }
    });
  }

  set_stubs(stubs: typeof Util.stubs) {
    Util.stubs = stubs;
  }

  post_window_message(target: Window, name: string, data?: any) {
    target.postMessage({ name, data }, "*");
  }

  blob_to_base64(blob: Blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }

  download_string(str: BlobPart, name: string) {
    const blob = new Blob([str], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    document.body.appendChild(a);
    a.setAttribute("style", "display: none");
    a.href = url;
    a.download = name;
    a.click();

    window.URL.revokeObjectURL(url);
  }

  download_blob(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    document.body.appendChild(a);
    a.setAttribute("style", "display: none");
    a.href = url;
    a.download = name;
    a.click();

    window.URL.revokeObjectURL(url);
  }

  find_and_remove(arr: any[], key: string, value: any) {
    for (var i = arr.length; i--; ) {
      if (arr[i][key] === value) {
        arr.splice(i, 1);
      }
    }
  }

  chunks(arr: Array<any>, chunk_size: number) {
    let chunks = [] as Array<Array<any>>;
    let len = arr.length;
    for (let i = 0; i < len; i += chunk_size) {
      chunks.push(arr.slice(i, i + chunk_size));
    }
    return chunks;
  }

  find<T>(arr: any[], key: string, value: any): T | null {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][key] === value) {
        return arr[i] as T;
      }
    }
    return null;
  }

  find_all<T>(arr: T[], key: string, value: any): T[] {
    const all: T[] = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]?.[key] === value) {
        all.push(arr[i] as T);
      }
    }
    return all;
  }

  rows_to_data_arr(rows: any) {
    let data_arr: any[] = [];
    let data = {};
    // assume that the first row defines the property names of each object
    let property_name_arr = rows[0];
    for (let i = 1; i < rows.length; i++) {
      data = {};
      for (let j = 0; j < property_name_arr.length; j++) {
        data[property_name_arr[j]] = rows[i][j];
      }
      data_arr.push(data);
    }
    return data_arr;
  }

  to_data_url<T>(url: string | URL): Promise<T> {
    return new Promise<T>((resolve: (value: T | PromiseLike<T>) => void) => {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result as T);
        };
        reader.readAsDataURL(xhr.response);
      };

      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.send();
    });
  }

  get_global_vars() {
    // Grab browser's default global variables.
    const iframe = window.document.createElement("iframe");
    iframe.src = "about:blank";
    window.document.body.appendChild(iframe);
    // @ts-ignore
    const browserGlobals = Object.keys(iframe.contentWindow);
    window.document.body.removeChild(iframe);
    // Get the global variables added at runtime by filtering out the browser's
    // default global variables from the current window object.
    const runtimeGlobals = Object.keys(window).filter((key) => {
      const isFromBrowser = browserGlobals.includes(key);
      return !isFromBrowser;
    });
    console.log("Runtime globals", runtimeGlobals);
    return runtimeGlobals;
  }

  wrap_class(item: Class, ignore: string[] = []) {
    let log_module = log;
    let class_name = item.name;
    let methods = this.get_methods(item.prototype);
    methods.forEach((method_name) => {
      let original = item.prototype[method_name];
      item.prototype[method_name] = function () {
        let log: any = {
          ignore: ignore.includes(method_name),
          obj: this,
          class_name,
          method_name,
          args: Array.from(arguments),
          stub: false,
        };
        const { stubs } = Util;
        if (stubs && stubs[0] && stubs[0].class_name === class_name && stubs[0].method_name === method_name) {
          log.stub = true;
          log.output = stubs[0].output;
          stubs.splice(0, 1);
          log_module.write_method_call(log);
          return log.output;
        } else {
          try {
            log.output = original.apply(this, arguments);
          } catch (e) {
            log.error = true;
            // @ts-ignore
            log.stack = e.stack;
            log.output = null;
          }
          if (log.output && log.output.then) {
            log.output = new Promise((resolve) => {
              log.output
                .then((result) => {
                  log.output = result;
                  log_module.write_method_call(log);
                  resolve(result);
                })
                .catch((e) => {
                  log.error = true;
                  log.stack = e.stack;
                  log.output = null;
                  log_module.write_method_call(log);
                  resolve(null);
                });
            });
          } else {
            log_module.write_method_call(log);
          }
          return log.output;
        }
      };
    });
  }

  get_url(base: string, version_frontend?: string) {
    return base.replace("{version_frontend}", version_frontend || "");
  }
  decode_jwt(token) {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  }
  async fetch(url, method, headers, body) {
    try {
      let data = {
        method,
        headers,
      } as any;
      if (method === "POST") {
        data.body = JSON.stringify(body);
      }
      let r = await fetch(url, data);
      let text = await r.text();
      let json = this.decode_json(text);
      return {
        success: true,
        status: r.status,
        json,
      };
    } catch (e) {
      return {
        success: false,
        status: 800,
        error: e,
      };
    }
  }
  // remove functiosn from an object to make it passable
  // via windows.postMessage
  // simplify(obj, seen_objects?) {
  //   try {
  //     //
  //     if (!seen_objects) {
  //       seen_objects = new Set();
  //     }
  //     //
  //     if (this.is_bool(obj)) {
  //       return obj;
  //     } else if (this.is_nan(obj)) {
  //       return "NaN";
  //     } else if (this.is_null(obj)) {
  //       return null;
  //     } else if (this.is_undefined(obj)) {
  //       return undefined;
  //     } else if (this.is_number(obj)) {
  //       return obj;
  //     } else if (this.is_string(obj)) {
  //       return obj;
  //     } else if (this.is_array(obj)) {
  //       if (seen_objects.has(obj) === false) {
  //         seen_objects.add(obj);
  //       }
  //       let new_obj = [] as any;
  //       for (let i = 0; i < obj.length; i++) {
  //         if (seen_objects.has(obj[i])) {
  //           new_obj[i] = "seen_object";
  //         } else {
  //           new_obj[i] = this.simplify(obj[i], seen_objects);
  //         }
  //       }
  //       return new_obj;
  //     } else if (this.is_simple_object(obj)) {
  //       if (seen_objects.has(obj) === false) {
  //         seen_objects.add(obj);
  //       }
  //       let new_obj = {};
  //       for (var key in obj) {
  //         if (seen_objects.has(obj[key])) {
  //           new_obj[key] = "seen_object";
  //         } else {
  //           new_obj[key] = this.simplify(obj[key], seen_objects);
  //         }
  //       }
  //       return new_obj;
  //     } else {
  //       return "complex_object";
  //     }
  //     //
  //   } catch (e) {
  //     let error = e as any;
  //     return {
  //       result: "obfuscation_error",
  //       message: error.message,
  //       stack: error.stack,
  //     };
  //   }
  // }
  // obfuscate(obj, seen_objects?) {
  //   try {
  //     //
  //     if (!seen_objects) {
  //       seen_objects = new Set();
  //     }
  //     //
  //     if (seen_objects.has(obj)) {
  //       return "seen_object";
  //     } else {
  //       seen_objects.add(obj);
  //     }
  //     //
  //     if (this.is_bool(obj)) {
  //       return "bool";
  //     } else if (this.is_nan(obj)) {
  //       return "nan";
  //     } else if (this.is_null(obj)) {
  //       return "null";
  //     } else if (this.is_undefined(obj)) {
  //       return "undefined";
  //     } else if (this.is_number(obj)) {
  //       return obj;
  //       // return "number";
  //     } else if (this.is_string(obj)) {
  //       return "string " + obj.length;
  //       return "string";
  //     } else if (this.is_array(obj)) {
  //       let new_obj = [] as any;
  //       for (let i = 0; i < obj.length; i++) {
  //         new_obj[i] = this.obfuscate(obj[i]);
  //       }
  //       return new_obj;
  //     } else if (this.is_simple_object(obj)) {
  //       let new_obj = {};
  //       for (var key in obj) {
  //         new_obj[key] = this.obfuscate(obj[key]);
  //       }
  //       return new_obj;
  //     } else {
  //       return "complex_object";
  //     }
  //     //
  //   } catch (e) {
  //     let error = e as any;
  //     return {
  //       result: "obfuscation_error",
  //       message: error.message,
  //       stack: error.stack,
  //     };
  //   }
  // }
  //
  // on_storage_change(callback) {
  //   if (config.mode === "dev" || config.mode === "prod") {
  //     chrome.storage.onChanged.addListener(callback);
  //   } else {
  //   }
  // }
  // on_runtime_message(callback_1) {
  //   if (config.mode === "dev" || config.mode === "prod") {
  //     chrome.runtime.onMessage.addListener((message, sender, callback) => {
  //       callback_1(message, sender, callback);
  //     });
  //   } else {
  //   }
  // }
  //

  copy_to_clipboard(text: string | undefined): void {
    if (!text) return;
    const input = document.createElement("textarea");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  }
  get_random_item(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  //
}

export function decode_jwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

// util for dev
function get_global_vars() {
  // Grab browser's default global variables.
  const iframe = window.document.createElement("iframe");
  iframe.src = "about:blank";
  window.document.body.appendChild(iframe);
  // @ts-ignore
  const browserGlobals = Object.keys(iframe.contentWindow);
  window.document.body.removeChild(iframe);
  // Get the global variables added at runtime by filtering out the browser's
  // default global variables from the current window object.
  const runtimeGlobals = Object.keys(window).filter((key) => {
    const isFromBrowser = browserGlobals.includes(key);
    return !isFromBrowser;
  });
  console.log("Runtime globals", runtimeGlobals);
  return runtimeGlobals;
}

// util for dev
//
function dig(seen_objects, path, src) {
  seen_objects.add(src);
  let keys = Object.keys(src);
  for (let len = keys.length, i = 0; i < len; i++) {
    let key = keys[i];
    // @ts-ignore
    let v = src[key];
    if (!v || seen_objects.has(v)) {
      continue;
    }
    if (typeof v === "string") {
      console.log(path.join("."), key, v);
    } else if (typeof v === "object") {
      let a = [];
      let new_path = JSON.parse(JSON.stringify(path));
      new_path.push(key);
      try {
        this.dig(seen_objects, new_path, v);
      } catch (error) {
        console.log("error", error);
      }
    }
  }
}
// dig( new Set(), [], window )

const util = new Util();
export default util;
