# Sort Package.json

[![Build Status](https://travis-ci.org/keithamus/sort-package-json.svg)](https://travis-ci.org/keithamus/sort-package-json)

## CLI

### Run via npx (npm@5.2+ required)

```bash
npx sort-package-json
```

### Install

```bash
npm install --global sort-package-json
```

### Usage

```bash
$ cd my-project
$ cat package.json
{
  "dependencies": {
    "sort-package-json": "1.0.0",
    "sort-object-keys": "1.0.0"
  },
  "version": "1.0.0",
  "name": "my-awesome-project"
}

$ npx sort-package-json
package.json is sorted!

$ cat package.json
{
  "name": "my-awesome-project",
  "version": "1.0.0",
  "dependencies": {
    "sort-object-keys": "1.0.0",
    "sort-package-json": "1.0.0"
  }
}
```

CLI also supports multi file paths or [`glob`](https://github.com/sindresorhus/globby) - so you can give it a bunch of `package.json` file(s) to sort.

```bash
$ sort-package-json "my-package/package.json" "other-package/package.json"

$ sort-package-json "package.json" "packages/*/package.json"
```

#### `--check` flag

When you want to check if your files are sorted, you can run CLI with the `--check` flag (or `-c`). This will output a list of not sorted files, if any.

```bash
$ sort-package-json "**/package.json" --check

# 5 matched files are sorted.


$ sort-package-json "**/package.json" --check
# foo/package.json
# bar/package.json

# 2 of 5 matched files are not sorted.
```

## API

### Install

```bash
npm install --save-dev sort-package-json
```

### Usage

```js
sortPackageJson(packageJson, options?)
```

Pass a JSON string, return a new sorted JSON string.\
Pass a JSON object, return a new sorted JSON object.

```js
const sortPackageJson = require('sort-package-json')

const packageJsonString = `{
  "dependencies": {
    "sort-package-json": "1.0.0",
    "sort-object-keys": "1.0.0"
  },
  "version": "1.0.0",
  "name": "my-awesome-project"
}`

console.log(sortPackageJson(packageJsonString))
/* => string:
{
  "name": "my-awesome-project",
  "version": "1.0.0",
  "dependencies": {
    "sort-object-keys": "1.0.0",
    "sort-package-json": "1.0.0"
  }
}
*/

const packageJsonObject = JSON.parse(packageJsonString)
console.log(sortPackageJson(packageJsonObject))
/* => object:
{
  name: 'my-awesome-project',
  version: '1.0.0',
  dependencies: {
    'sort-object-keys': '1.0.0',
    'sort-package-json': '1.0.0'
  }
}
*/
```

#### options.sortOrder

Type: `string[] | Function`\
Default: `sortPackageJson.sortOrder`

Custom ordering array or comparator function.

If an array, sort keys in ordering of `options.sortOrder`.

**Notice**: fields not in this array, will still sort by `defaultSortOrder`

```js
const sorted = sortPackageJson(packageJsonObject, {
  sortOrder: ['version']
})

console.log(Object.keys(sorted))

// -> [ 'version', 'name', 'dependencies' ]
//                 ^^^^^^^^^^^^^^^^^^^^^^
//                 `name` and `dependencies` are sorted by defaultSortOrder
```

If a function, sort fields by [Array#sort(options.sortOrder)](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Description)

```js
const sorted = sortPackageJson(packageJsonObject, {
  sortOrder(left, right) {
    return left.localeCompare(right)
  }
})

console.log(Object.keys(sorted))

// -> [ 'dependencies', 'name', 'version' ]
```

## Related tools

- [ESLint Rule with Autofix](https://github.com/kellyselden/eslint-plugin-json-files#supported-rules)
- [Prettier Plugin](https://github.com/matzkoh/prettier-plugin-packagejson)
- [Visual Studio Code Extension](https://github.com/unional/vscode-sort-package-json)

## Supported Libraries

- [AVA](https://github.com/avajs/ava)
- [Babel](https://babeljs.io/)
- [Browserify](http://browserify.org/)
- [commitlint](https://commitlint.js.org/)
- [ESLint](https://eslint.org/)
- [Husky](https://github.com/typicode/husky)
- [Istanbul](https://istanbul.js.org/)
- [Jest](https://jestjs.io/)
- [lint-staged](https://github.com/okonet/lint-staged)
- [Mocha](https://mochajs.org/)
- [node-pre-gyp](https://github.com/mapbox/node-pre-gyp)
- [npm-package-json-lint](https://npmpackagejsonlint.org/)
- [Prettier](https://prettier.io/)
- [remark](https://remark.js.org/)
- [stylelint](https://github.com/stylelint/stylelint)
- [Tap](https://node-tap.org/)
- [xojs](https://github.com/xojs/xo)

_Alphabetically ordered._

## Automatically Sort

The package.json file can be sorted automatically before committing, install `husky` and `lint-staged` and add the following to your `package.json` file:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "package.json": [
      "sort-package-json",
      "git add"
    ]
  }
}
```

## PFAQ: Potential Frequently Asked Questions

### How does it sort?

It sorts using [`sort-object-keys`](http://github.com/keithamus/sort-object-keys). It sorts using the well-known keys of a package.json. For the full list it's just easier to [read the code](./index.js). It sorts sub-keys too - sometimes by a well-known order, other times alphabetically. The initial order was derived from the [package.json docs](https://docs.npmjs.com/files/package.json) with a few extras added for good measure.

### It doesn't sort X?

Cool. Send a PR! It might get denied if it is a specific vendor key of an unpopular project (e.g. `"my-super-unknown-project"`). We sort keys like "browserify" because it is a project with millions of users. If your project has, say, over 100 users, then we'll add it. Sound fair?

### Isn't this just like Project X?

Could be. I wanted this one because at the time of writing, nothing is:

- Zero config
- Able to be used in a library
- Quiet (i.e. not spitting out annoying log messages, when used in a library mode)

### What?! Why would you want to do this?!

Well, it's nice to have the keys of a package.json in a well sorted order. Almost everyone would agree having "name" at the top of a package.json is sensible (rather than sorted alphabetically or somewhere silly like the bottom), so why not the rest of the package.json?
