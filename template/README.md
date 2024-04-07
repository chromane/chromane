# Browser Extension

### Build Extensions to the `/temp_ext_build` repo

```bash
$ npm install
$ npx chromane build
```

### Launch Dev process that watches for changes and generates the `/temp_ext_install` folder with an installable extension

```bash
$ npx chromane dev
```

### Installing developer versions on Chrome

1. Go to your [Chrome Extension Tab](chrome://extensions/)

2. Make sure developer mode is enabled

3. Click "Load unpacked extension..." Be sure to select the entire folder containing the `manifest.json` file from `/temp_ext_install` or `/temp_ext_build` ( not `/prj_ext` )