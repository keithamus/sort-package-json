const sortObjectKeys = require('sort-object-keys')
const detectIndent = require('detect-indent')
const detectNewline = require('detect-newline').graceful
const gitHooks = require('git-hooks-list')

const hasOwnProperty = (object, property) =>
  Object.prototype.hasOwnProperty.call(object, property)
const pipe = fns => x => fns.reduce((result, fn) => fn(result), x)
const onArray = fn => x => (Array.isArray(x) ? fn(x) : x)
const uniq = onArray(xs => xs.filter((x, i) => i === xs.indexOf(x)))
const sortArray = onArray(array => [...array].sort())
const uniqAndSortArray = pipe([uniq, sortArray])
const isPlainObject = x =>
  x && Object.prototype.toString.call(x) === '[object Object]'
const onObject = fn => x => (isPlainObject(x) ? fn(x) : x)
const sortObjectBy = comparator => onObject(x => sortObjectKeys(x, comparator))
const sortObject = sortObjectBy()
const sortURLObject = sortObjectBy(['type', 'url'])
const sortPeopleObject = sortObjectBy(['name', 'email', 'url'])
const sortDirectories = sortObjectBy([
  'lib',
  'bin',
  'man',
  'doc',
  'example',
  'test',
])
const overProperty = (property, over) => object =>
  hasOwnProperty(object, property)
    ? Object.assign(object, { [property]: over(object[property]) })
    : object
const sortGitHooks = sortObjectBy(gitHooks)
const sortESLintConfig = sortObjectBy([
  'env',
  'parser',
  'parserOptions',
  'settings',
  'plugins',
  'extends',
  'rules',
  'overrides',
  'globals',
  'processor',
  'noInlineConfig',
  'reportUnusedDisableDirectives',
])
const sortVSCodeBadgeObject = sortObjectBy(['description', 'url', 'href'])

const sortPrettierConfigKeys = onObject(config =>
  sortObjectKeys(config, [
    ...Object.keys(config)
      .filter(key => key !== 'overrides')
      .sort(),
    'overrides',
  ]),
)
const sortPrettierConfigOptions = pipe([
  sortObject,
  overProperty('options', sortObject),
])
const sortPrettierConfigOverrides = onArray(overrides =>
  overrides.map(sortPrettierConfigOptions),
)
const sortPrettierConfig = pipe([
  sortPrettierConfigKeys,
  onObject(overProperty('overrides', sortPrettierConfigOverrides)),
])

// See https://docs.npmjs.com/misc/scripts
const defaultNpmScripts = new Set([
  'install',
  'pack',
  'prepare',
  'publish',
  'restart',
  'shrinkwrap',
  'start',
  'stop',
  'test',
  'uninstall',
  'version',
])

const sortScripts = scripts => {
  const names = Object.keys(scripts)
  const prefixable = new Set()

  const keys = names
    .map(name => {
      const omitted = name.replace(/^(?:pre|post)/, '')
      if (defaultNpmScripts.has(omitted) || names.includes(omitted)) {
        prefixable.add(omitted)
        return omitted
      }
      return name
    })
    .sort()

  const order = keys.reduce(
    (order, key) =>
      order.concat(
        prefixable.has(key) ? [`pre${key}`, key, `post${key}`] : [key],
      ),
    [],
  )

  return sortObjectBy(order)(scripts)
}

// fields marked `vscode` are for `Visual Studio Code extension manifest` only
// https://code.visualstudio.com/api/references/extension-manifest
// Supported fields:
// publisher, displayName, categories, galleryBanner, preview, contributes,
// activationEvents, badges, markdown, qna, extensionPack,
// extensionDependencies, icon

// field.key{string}: field name
// field.over{function}: sort field subKey
const fields = [
  { key: 'name' },
  /* vscode */ { key: 'displayName' },
  { key: 'version' },
  { key: 'private' },
  { key: 'description' },
  /* vscode */ { key: 'categories', over: uniq },
  { key: 'keywords', over: uniq },
  { key: 'homepage' },
  { key: 'bugs', over: sortObjectBy(['url', 'email']) },
  { key: 'repository', over: sortURLObject },
  { key: 'funding', over: sortURLObject },
  { key: 'license', over: sortURLObject },
  /* vscode */ { key: 'qna' },
  { key: 'author', over: sortPeopleObject },
  {
    key: 'contributors',
    over: onArray(contributors => contributors.map(sortPeopleObject)),
  },
  /* vscode */ { key: 'publisher' },
  { key: 'files', over: uniq },
  { key: 'sideEffects' },
  { key: 'type' },
  { key: 'exports', over: sortObject },
  { key: 'main' },
  { key: 'umd:main' },
  { key: 'jsdelivr' },
  { key: 'unpkg' },
  { key: 'module' },
  { key: 'source' },
  { key: 'jsnext:main' },
  { key: 'browser' },
  { key: 'types' },
  { key: 'typings' },
  { key: 'style' },
  { key: 'example' },
  { key: 'examplestyle' },
  { key: 'assets' },
  { key: 'bin', over: sortObject },
  { key: 'man' },
  { key: 'directories', over: sortDirectories },
  { key: 'workspaces' },
  // node-pre-gyp https://www.npmjs.com/package/node-pre-gyp#1-add-new-entries-to-your-packagejson
  {
    key: 'binary',
    over: sortObjectBy([
      'module_name',
      'module_path',
      'remote_path',
      'package_name',
      'host',
    ]),
  },
  { key: 'scripts', over: sortScripts },
  { key: 'betterScripts', over: sortScripts },
  /* vscode */ { key: 'contributes', over: sortObject },
  /* vscode */ { key: 'activationEvents', over: uniq },
  { key: 'husky', over: overProperty('hooks', sortGitHooks) },
  { key: 'pre-commit' },
  { key: 'commitlint', over: sortObject },
  { key: 'lint-staged', over: sortObject },
  { key: 'config', over: sortObject },
  { key: 'nodemonConfig', over: sortObject },
  { key: 'browserify', over: sortObject },
  { key: 'babel', over: sortObject },
  { key: 'browserslist' },
  { key: 'xo', over: sortObject },
  { key: 'prettier', over: sortPrettierConfig },
  { key: 'eslintConfig', over: sortESLintConfig },
  { key: 'eslintIgnore' },
  { key: 'stylelint' },
  { key: 'ava', over: sortObject },
  { key: 'jest', over: sortObject },
  { key: 'mocha', over: sortObject },
  { key: 'nyc', over: sortObject },
  { key: 'resolutions', over: sortObject },
  { key: 'dependencies', over: sortObject },
  { key: 'devDependencies', over: sortObject },
  { key: 'peerDependencies', over: sortObject },
  { key: 'optionalDependencies', over: sortObject },
  { key: 'bundledDependencies', over: uniqAndSortArray },
  { key: 'bundleDependencies', over: uniqAndSortArray },
  /* vscode */ { key: 'extensionPack', over: uniqAndSortArray },
  /* vscode */ { key: 'extensionDependencies', over: uniqAndSortArray },
  { key: 'flat' },
  { key: 'engines', over: sortObject },
  { key: 'engineStrict', over: sortObject },
  { key: 'os' },
  { key: 'cpu' },
  { key: 'preferGlobal', over: sortObject },
  { key: 'publishConfig', over: sortObject },
  /* vscode */ { key: 'icon' },
  /* vscode */ {
    key: 'badges',
    over: onArray(badge => badge.map(sortVSCodeBadgeObject)),
  },
  /* vscode */ { key: 'galleryBanner', over: sortObject },
  /* vscode */ { key: 'preview' },
  /* vscode */ { key: 'markdown' },
]

const defaultSortOrder = fields.map(({ key }) => key)
const overFields = pipe(
  fields.reduce((fns, { key, over }) => {
    if (over) {
      fns.push(overProperty(key, over))
    }
    return fns
  }, []),
)

function editStringJSON(json, over) {
  if (typeof json === 'string') {
    const { indent } = detectIndent(json)
    const endCharacters = json.slice(-1) === '\n' ? '\n' : ''
    const newline = detectNewline(json)
    json = JSON.parse(json)

    let result = JSON.stringify(over(json), null, indent) + endCharacters
    if (newline === '\r\n') {
      result = result.replace(/\n/g, newline)
    }
    return result
  }

  return over(json)
}

const isPrivateKey = key => key[0] === '_'
const partition = (array, predicate) =>
  array.reduce(
    (result, value) => {
      result[predicate(value) ? 0 : 1].push(value)
      return result
    },
    [[], []],
  )
function sortPackageJson(jsonIsh, options = {}) {
  return editStringJSON(
    jsonIsh,
    onObject(json => {
      let sortOrder = options.sortOrder ? options.sortOrder : defaultSortOrder

      if (Array.isArray(sortOrder)) {
        const keys = Object.keys(json)
        const [privateKeys, publicKeys] = partition(keys, isPrivateKey)
        sortOrder = [
          ...sortOrder,
          ...defaultSortOrder,
          ...publicKeys.sort(),
          ...privateKeys.sort(),
        ]
      }

      return overFields(sortObjectKeys(json, sortOrder))
    }),
  )
}

module.exports = sortPackageJson
module.exports.sortPackageJson = sortPackageJson
module.exports.sortOrder = defaultSortOrder
