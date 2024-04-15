import { decode_json, encode_json } from "@chromane/shared/ts/helpers";

export default {
  init(_window: any) {
    _window.chrome = {
      tabs: {
        create({ url }) {
          window.open(url);
        },
      },
      storage: {
        local: {
          async set(obj) {
            console.log("set123", obj);
            for (let key in obj) {
              localStorage.setItem(key, encode_json(obj[key]));
            }
          },
          async get(arr) {
            console.log("get123", arr);
            let storage = {};
            for (let key of arr) {
              storage[key] = decode_json(localStorage.getItem(key));
            }
            console.log("get123", storage);
            return storage;
          },
        },
      },
    };
  },
};
