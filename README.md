# esbuild-plugin-gas

An esbuild plugin for Google Apps Script

## Installation

1. Authenticate to GitHub Packages and specify the GitHub Packages URL along with the namespace:

   .npmrc

   ```
   //npm.pkg.github.com/:_authToken=${NPM_TOKEN}
   @hemlock5738:registry=https://npm.pkg.github.com
   ```

2. Install package:

   ```sh
   npm install -D @hemlock5738/esbuild-plugin-gas
   ```

## Usage

1. Create build script:

   build.js

   ```js
   import esbuild from 'esbuild';
   import { gasPlugin } from '@hemlock5738/esbuild-plugin-gas';

   esbuild
     .build({
       bundle: true,
       entryPoints: ['src/index.js'],
       format: 'iife',
       globalName: '_',
       outfile: 'dist/index.js',
       plugins: [gasPlugin()],
       write: false,
     })
     .catch(e => {
       console.error(e);
       process.exit(1);
     });
   ```

2. Execute:

   ```sh
   node build.js
   ```

## Example

### Source files

src/index.js

```js
import { add } from './add.js';

const sub = (x, y) => {
  return x - y;
};

const VERSION = 2;

export { add, sub, VERSION };
```

src/add.js

```js
function add(x, y) {
  return x + y;
}

export { add };
```

### Output file

dist/index.js

```js
'use strict';
var _ = (() => {
  /* build code here */
})();
Object.assign(globalThis, {
  VERSION: _.VERSION,
  add: _.add,
  sub: _.sub,
});
var VERSION;
function add() {}
var sub;
```

## License

[MIT](LICENSE)
