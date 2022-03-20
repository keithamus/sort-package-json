# Default Rules

`package.json` fields are sorted by the order they are listed below. The default key sort order is alphabetical.

_Note: when a specific key order is used, any other keys will be sorted in the end of the object_

| Key                   | Rules                                                                          |
| --------------------- | ------------------------------------------------------------------------------ |
| \$schema              |                                                                                |
| name                  |                                                                                |
| displayName           |                                                                                |
| version               |                                                                                |
| private               |                                                                                |
| description           |                                                                                |
| categories            | Unique items                                                                   |
| keywords              | Unique items                                                                   |
| homepage              |                                                                                |
| bugs                  | Key order: `url`, `email`                                                      |
| repository            | Key order: `type`, `url`                                                       |
| funding               | Key order: `type`, `url`                                                       |
| license               | Key order: `type`, `url`                                                       |
| qna                   |                                                                                |
| author                | Key order: `name`, `email`, `url`                                              |
| maintainers           | Key order (per item): `name`, `email`, `url`                                   |
| contributors          | Key order (per item): `name`, `email`, `url`                                   |
| publisher             |                                                                                |
| sideEffects           |                                                                                |
| type                  |                                                                                |
| imports               |                                                                                |
| exports               |                                                                                |
| main                  |                                                                                |
| umd:main              |                                                                                |
| jsdelivr              |                                                                                |
| unpkg                 |                                                                                |
| module                |                                                                                |
| source                |                                                                                |
| jsnext:main           |                                                                                |
| browser               |                                                                                |
| react-native          |                                                                                |
| types                 |                                                                                |
| typesVersions         |                                                                                |
| typings               |                                                                                |
| style                 |                                                                                |
| example               |                                                                                |
| examplestyle          |                                                                                |
| assets                |                                                                                |
| bin                   | Key sort                                                                       |
| man                   |                                                                                |
| directories           | Key order: `lib`, `bin`, `man`, `doc`, `example`, `test`                       |
| files                 | Unique items                                                                   |
| workspaces            |                                                                                |
| binary,               | Key order: `module_name`, `module_path`, `remote_path`, `package_name`, `host` |
| scripts               | [Script sort](#scripts)                                                        |
| betterScripts         | [Script sort](#scripts)                                                        |
| contributes           | Key sort                                                                       |
| activationEvents      | Unique items                                                                   |
| husky                 | Sorts the `hooks` field using [git hook sort](#git-hooks)                      |
| simple-git-hooks      | Key sort using [git hook sort](#git-hooks)                                     |
| pre-commit            |                                                                                |
| commitlint            | Key sort                                                                       |
| lint-staged           |                                                                                |
| config                | Key sort                                                                       |
| nodemonConfig         | Key sort                                                                       |
| browserify            | Key sort                                                                       |
| babel                 | Key sort                                                                       |
| browserslist          |                                                                                |
| xo                    | Key sort                                                                       |
| prettier              | [Prettier sort](#prettier)                                                     |
| eslintConfig          | [ESLint sort](#eslint)                                                         |
| eslintIgnore          |                                                                                |
| npmpackagejsonlint    | Key sort (also recognizes: npmPackageJsonLintConfig, npmpkgjsonlint)           |
| release               | Key sort                                                                       |
| remarkConfig          | Key sort                                                                       |
| stylelint             |                                                                                |
| ava                   | Key sort                                                                       |
| jest                  | Key sort                                                                       |
| mocha                 | Key sort                                                                       |
| nyc                   | Key sort                                                                       |
| tap                   | Key sort                                                                       |
| resolutions           | Key sort                                                                       |
| dependencies          | Key sort                                                                       |
| devDependencies       | Key sort                                                                       |
| dependenciesMeta      | Key sort (deep)                                                                |
| peerDependencies      | Key sort                                                                       |
| peerDependenciesMeta  | Key sort (deep)                                                                |
| optionalDependencies  | Key sort                                                                       |
| bundledDependencies   | Sort unique items                                                              |
| bundleDependencies    | Sort unique items                                                              |
| extensionPack         | Sort unique items                                                              |
| extensionDependencies | Sort unique items                                                              |
| flat                  |                                                                                |
| packageManager        |                                                                                |
| engines               | Key sort                                                                       |
| engineStrict          | Key sort                                                                       |
| languageName          |                                                                                |
| os                    |                                                                                |
| cpu                   |                                                                                |
| preferGlobal          | Key sort                                                                       |
| publishConfig         | Key sort                                                                       |
| icon                  |                                                                                |
| badges                | Key order (per item): `description`, `url`, `href`                             |
| galleryBanner         | Key sort                                                                       |
| preview               |                                                                                |
| markdown              |                                                                                |

## Special Rules

### ESLint

Fields are sorted by the order they are listed below:

| Key                           | Rules                                                               |
| ----------------------------- | ------------------------------------------------------------------- |
| env                           |                                                                     |
| parser                        |                                                                     |
| parserOptions                 |                                                                     |
| settings                      |                                                                     |
| plugins                       |                                                                     |
| extends                       |                                                                     |
| rules                         | Group built-in rules first, then plugin rules. Each group is sorted |
| overrides                     | Key order (per item): `files`, `excludedFiles`                      |
| globals                       |                                                                     |
| processor                     |                                                                     |
| noInlineConfig                |                                                                     |
| reportUnusedDisableDirectives |                                                                     |

### Git Hooks

Item order:

- `applypatch-msg`
- `pre-applypatch`
- `post-applypatch`
- `pre-commit`
- `pre-merge-commit`
- `prepare-commit-msg`
- `commit-msg`
- `post-commit`
- `pre-rebase`
- `post-checkout`
- `post-merge`
- `pre-push`
- `pre-receive`
- `update`
- `post-receive`
- `post-update`
- `push-to-checkout`
- `pre-auto-gc`
- `post-rewrite`
- `sendemail-validate`
- `fsmonitor-watchman`
- `p4-pre-submit`
- `post-index-chang`

### Prettier

Keys are sorted alphabetically except for `overrides`, which is placed last. Keys are also sorted in `overrides` and `overrides.options` items.

### Scripts

Keys are sorted alphabetically except for [pre/post scripts](https://docs.npmjs.com/cli/v6/using-npm/scripts#pre--post-scripts). Those are placed before and after their corresponding base npm script.

An example - notice how `preinstall` and `postinstall` are placed before and after `install`:

```json
{
  "scripts": {
    "build": "",
    "preinstall": "",
    "install": "",
    "postinstall": "",
    "lint": ""
  }
}
```

Scripts for which the pre/post order is applied:

- install
- pack
- prepare
- publish
- restart
- shrinkwrap
- start
- stop
- test
- uninstall
- version
