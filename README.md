# Chromane

Chromane is a framework for developing chrome extensions with most of their UI source code living outside of the chrome extension package, in a remotely hosted page, that is included in the extension via an iFrame.

Here are some benefits of this approach:

- Chrome extension package has smaller size and loads faster on first install.
- Less actual chrome extension code in the package which makes review process easier.
- Avoid the review process of changes unrelated to the actuall chrome extension code.
- Google-recommended config approach out of the box.
- Reduce reliance on the host website, changes to which may break our extension.

## Installation

```bash
$ npm i chromane
$ npx chromane init
```
