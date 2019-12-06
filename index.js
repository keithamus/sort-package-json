#!/usr/bin/env node
const sortObjectKeys = require('sort-object-keys')
const detectIndent = require('detect-indent')
const glob = require('glob')

function sortSubKey(comparator, unique) {
  return function(object, key) {
    if (Array.isArray(object[key])) {
      object[key] = sort(object[key])
      if (unique) object[key] = uniq(object[key])
      return
    }

    if (typeof object[key] === 'object') {
      object[key] = sortObjectKeys(
        object[key],
        typeof comparator === 'function' ? comparator(object) : comparator,
      )
    }
  }
}

const sortScripts = object => {
  const prefixableScripts = defaultNpmScripts
  Object.keys(object.scripts).forEach(script => {
    const prefixOmitted = script.replace(prefixedScriptRegex, '$2')
    if (
      object.scripts[prefixOmitted] &&
      !prefixableScripts.includes(prefixOmitted)
    ) {
      prefixableScripts.push(prefixOmitted)
    }
  })
  return compareScriptKeys(toSortKey(prefixableScripts))
}

// field.key{string}: field name
// field.over{function}: sort field subKey
const fields = [
  { key: 'name' },
  { key: 'version' },
  { key: 'private', over: sortSubKey() },
  { key: 'description' },
  { key: 'keywords', over: sortSubKey([], true) },
  { key: 'homepage', over: sortSubKey() },
  { key: 'bugs', over: sortSubKey(['url', 'email']) },
  { key: 'repository', over: sortSubKey(['type', 'url']) },
  { key: 'funding', over: sortSubKey(['type', 'url']) },
  { key: 'license', over: sortSubKey(['type', 'url']) },
  { key: 'author', over: sortSubKey(['name', 'email', 'url']) },
  { key: 'contributors' },
  { key: 'files' },
  { key: 'sideEffects' },
  { key: 'type' },
  { key: 'exports', over: sortSubKey() },
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
  { key: 'bin', over: sortSubKey() },
  { key: 'man', over: sortSubKey() },
  {
    key: 'directories',
    over: sortSubKey(),
    sortList: ['lib', 'bin', 'man', 'doc', 'example'],
  },
  { key: 'workspaces' },
  { key: 'scripts', over: sortSubKey(sortScripts) },
  { key: 'betterScripts', over: sortSubKey(sortScripts) },
  { key: 'husky' },
  { key: 'pre-commit' },
  { key: 'commitlint', over: sortSubKey() },
  { key: 'lint-staged', over: sortSubKey() },
  { key: 'config', over: sortSubKey() },
  { key: 'nodemonConfig', over: sortSubKey() },
  { key: 'browserify', over: sortSubKey() },
  { key: 'babel', over: sortSubKey() },
  { key: 'browserslist' },
  { key: 'xo', over: sortSubKey() },
  { key: 'prettier', over: sortSubKey() },
  { key: 'eslintConfig', over: sortSubKey() },
  { key: 'eslintIgnore' },
  { key: 'stylelint' },
  { key: 'ava', over: sortSubKey() },
  { key: 'jest', over: sortSubKey() },
  { key: 'mocha', over: sortSubKey() },
  { key: 'nyc', over: sortSubKey() },
  { key: 'dependencies', over: sortSubKey() },
  { key: 'devDependencies', over: sortSubKey() },
  { key: 'peerDependencies', over: sortSubKey() },
  { key: 'bundledDependencies', over: sortSubKey() },
  { key: 'bundleDependencies', over: sortSubKey() },
  { key: 'optionalDependencies', over: sortSubKey() },
  { key: 'flat' },
  { key: 'resolutions', over: sortSubKey() },
  { key: 'engines', over: sortSubKey() },
  { key: 'engineStrict', over: sortSubKey() },
  { key: 'os', over: sortSubKey() },
  { key: 'cpu', over: sortSubKey() },
  { key: 'preferGlobal', over: sortSubKey() },
  { key: 'publishConfig', over: sortSubKey() },
]

const sortOrder = fields.map(({ key }) => key)

// See https://docs.npmjs.com/misc/scripts
const defaultNpmScripts = [
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
]

function parseJSON(jsonIsh) {
  let wasString = false
  let hasWindowsNewlines = false
  let endCharacters = ''
  let indentLevel = 2
  let packageJson = jsonIsh
  if (typeof packageJson === 'string') {
    wasString = true
    indentLevel = detectIndent(packageJson).indent
    if (packageJson.substr(-1) === '\n') {
      endCharacters = '\n'
    }
    const newlineMatch = packageJson.match(/(\r?\n)/)
    hasWindowsNewlines = (newlineMatch && newlineMatch[0]) === '\r\n'
    packageJson = JSON.parse(packageJson)
  }
  return {
    wasString,
    hasWindowsNewlines,
    endCharacters,
    indentLevel,
    packageJson,
  }
}

function stringifyJSON({
  wasString,
  hasWindowsNewlines,
  endCharacters,
  indentLevel,
  packageJson,
}) {
  if (wasString) {
    let result = JSON.stringify(packageJson, null, indentLevel) + endCharacters
    if (hasWindowsNewlines) {
      result = result.replace(/\n/g, '\r\n')
    }
    return result
  }
  return packageJson
}

const prefixedScriptRegex = /^(pre|post)(.)/
function toSortKey(prefixable) {
  return function(script) {
    const prefixOmitted = script.replace(prefixedScriptRegex, '$2')
    if (prefixable.includes(prefixOmitted)) {
      return prefixOmitted
    }
    return script
  }
}

/*             b
 *       pre | * | post
 *   pre  0  | - |  -
 * a  *   +  | 0 |  -
 *   post +  | + |  0
 */
function compareScriptKeys(sortKeyFn) {
  return function(a, b) {
    if (a === b) return 0
    const aScript = sortKeyFn(a)
    const bScript = sortKeyFn(b)
    if (aScript === bScript) {
      // pre* is always smaller; post* is always bigger
      // Covers: pre* vs. *; pre* vs. post*; * vs. post*
      if (a === `pre${aScript}` || b === `post${bScript}`) return -1
      // The rest is bigger: * vs. *pre; *post vs. *pre; *post vs. *
      return 1
    }
    return aScript < bScript ? -1 : 1
  }
}

const sort = xs => xs.slice().sort()
const uniq = xs => xs.filter((x, i) => i === xs.indexOf(x))

function sortPackageJson(jsonIsh, options = {}) {
  const determinedSortOrder = options.sortOrder || sortOrder
  const {
    wasString,
    hasWindowsNewlines,
    endCharacters,
    indentLevel,
    packageJson,
  } = parseJSON(jsonIsh)

  for (const options of fields) {
    if (options.over) options.over(packageJson, options.key)
  }

  return stringifyJSON({
    wasString,
    hasWindowsNewlines,
    endCharacters,
    indentLevel,
    packageJson: sortObjectKeys(packageJson, determinedSortOrder),
  })
}

module.exports = sortPackageJson
module.exports.sortPackageJson = sortPackageJson
module.exports.sortOrder = sortOrder

if (require.main === module) {
  const fs = require('fs')
  const isCheckFlag = argument => argument === '--check' || argument === '-c'

  const cliArguments = process.argv.slice(2)
  const isCheck = cliArguments.some(isCheckFlag)

  const patterns = cliArguments.filter(argument => !isCheckFlag(argument))

  if (!patterns.length) {
    patterns[0] = 'package.json'
  }

  const files = patterns.reduce(
    (files, pattern) => files.concat(glob.sync(pattern)),
    [],
  )

  let notSortedFiles = 0

  files.forEach(file => {
    const packageJson = fs.readFileSync(file, 'utf8')
    const sorted = sortPackageJson(packageJson)

    if (sorted !== packageJson) {
      if (isCheck) {
        notSortedFiles++
        console.log(file)
      } else {
        fs.writeFileSync(file, sorted, 'utf8')
        console.log(`${file} is sorted!`)
      }
    }
  })

  if (isCheck) {
    if (notSortedFiles) {
      console.log(
        notSortedFiles === 1
          ? `${notSortedFiles} file is not sorted.`
          : `\n ${notSortedFiles} files are not sorted.`,
      )
    } else {
      console.log(
        files.length === 1 ? `file is sorted.` : `all files are sorted.`,
      )
    }
    process.exit(notSortedFiles)
  }
}
