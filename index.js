#!/usr/bin/env node
const _sortObjectKeys = require('sort-object-keys')
const detectIndent = require('detect-indent')
const glob = require('glob')
const sortObjectKeys = comp => x => _sortObjectKeys(x, comp)

const sort = xs => xs.slice().sort()
const uniq = xs => xs.filter((x, i) => i === xs.indexOf(x))
const onObject = fn => x => (typeof x === 'object' ? fn(x) : x)
const sortObject = comparator => onObject(sortObjectKeys(comparator))

function sortArrayOrObject(comparator) {
  return function(field) {
    if (Array.isArray(field)) return sort(field)
    return sortObject(comparator)(field)
  }
}

const sortScripts = scripts => {
  const prefixableScripts = defaultNpmScripts
  Object.keys(scripts).forEach(script => {
    const prefixOmitted = script.replace(prefixedScriptRegex, '$2')
    if (scripts[prefixOmitted] && !prefixableScripts.includes(prefixOmitted)) {
      prefixableScripts.push(prefixOmitted)
    }
  })
  return sortObjectKeys(compareScriptKeys(toSortKey(prefixableScripts)))(
    scripts,
  )
}

// field.key{string}: field name
// field.over{function}: sort field subKey
const fields = [
  { key: 'name' },
  { key: 'version' },
  { key: 'private' },
  { key: 'description' },
  { key: 'keywords', over: uniq },
  { key: 'homepage' },
  { key: 'bugs', over: sortObject(['url', 'email']) },
  { key: 'repository', over: sortObject(['type', 'url']) },
  { key: 'funding', over: sortObject(['type', 'url']) },
  { key: 'license', over: sortObject(['type', 'url']) },
  { key: 'author', over: sortArrayOrObject(['name', 'email', 'url']) },
  { key: 'contributors', over: sortArrayOrObject(['name', 'email', 'url']) },
  { key: 'files' },
  { key: 'sideEffects' },
  { key: 'type' },
  { key: 'exports', over: sortObject() },
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
  { key: 'bin', over: sortObject() },
  { key: 'man', over: sortObject() },
  {
    key: 'directories',
    over: sortObject(['lib', 'bin', 'man', 'doc', 'example']),
  },
  { key: 'workspaces' },
  { key: 'scripts', over: sortScripts },
  { key: 'betterScripts', over: sortScripts },
  { key: 'husky' },
  { key: 'pre-commit' },
  { key: 'commitlint', over: sortObject() },
  { key: 'lint-staged', over: sortObject() },
  { key: 'config', over: sortObject() },
  { key: 'nodemonConfig', over: sortObject() },
  { key: 'browserify', over: sortObject() },
  { key: 'babel', over: sortObject() },
  { key: 'browserslist' },
  { key: 'xo', over: sortObject() },
  { key: 'prettier', over: sortObject() },
  { key: 'eslintConfig', over: sortObject() },
  { key: 'eslintIgnore' },
  { key: 'stylelint' },
  { key: 'ava', over: sortObject() },
  { key: 'jest', over: sortObject() },
  { key: 'mocha', over: sortObject() },
  { key: 'nyc', over: sortObject() },
  { key: 'dependencies', over: sortObject() },
  { key: 'devDependencies', over: sortObject() },
  { key: 'peerDependencies', over: sortObject() },
  { key: 'bundledDependencies', over: sortObject() },
  { key: 'bundleDependencies', over: sortObject() },
  { key: 'optionalDependencies', over: sortObject() },
  { key: 'flat' },
  { key: 'resolutions', over: sortObject() },
  { key: 'engines', over: sortObject() },
  { key: 'engineStrict', over: sortObject() },
  { key: 'os', over: sortObject() },
  { key: 'cpu', over: sortObject() },
  { key: 'preferGlobal', over: sortObject() },
  { key: 'publishConfig', over: sortObject() },
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

function sortPackageJson(jsonIsh, options = {}) {
  const {
    wasString,
    hasWindowsNewlines,
    endCharacters,
    indentLevel,
    packageJson,
  } = parseJSON(jsonIsh)

  const newJson = sortObjectKeys(options.sortOrder || sortOrder)(packageJson)

  for (const { key, over } of fields) {
    if (over && newJson[key]) newJson[key] = over(newJson[key])
  }

  return stringifyJSON({
    wasString,
    hasWindowsNewlines,
    endCharacters,
    indentLevel,
    packageJson: newJson,
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
