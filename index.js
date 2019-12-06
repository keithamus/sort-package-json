#!/usr/bin/env node
const sortObjectKeys = require('sort-object-keys')
const detectIndent = require('detect-indent')
const glob = require('glob')

// field.key{string}: field name
// field.sortSubKey{boolean}: sort field subKey
// field.sortList{string[]}: key order array
// field.unique{boolean}: unique array values
// field.sortScripts{boolean}: sort field as scripts
const fields = [
  { key: 'name', sortSubKey: false },
  { key: 'version', sortSubKey: false },
  { key: 'private', sortSubKey: true },
  { key: 'description', sortSubKey: false },
  { key: 'keywords', sortSubKey: true, unique: true },
  { key: 'homepage', sortSubKey: true },
  { key: 'bugs', sortSubKey: true, sortList: ['url', 'email'] },
  { key: 'repository', sortSubKey: true, sortList: ['type', 'url'] },
  { key: 'funding', sortSubKey: true, sortList: ['type', 'url'] },
  { key: 'license', sortSubKey: true, sortList: ['type', 'url'] },
  { key: 'author', sortSubKey: true, sortList: ['name', 'email', 'url'] },
  { key: 'contributors', sortSubKey: false },
  { key: 'files', sortSubKey: false },
  { key: 'sideEffects', sortSubKey: false },
  { key: 'type', sortSubKey: false },
  { key: 'exports', sortSubKey: true },
  { key: 'main', sortSubKey: false },
  { key: 'umd:main', sortSubKey: false },
  { key: 'jsdelivr', sortSubKey: false },
  { key: 'unpkg', sortSubKey: false },
  { key: 'module', sortSubKey: false },
  { key: 'source', sortSubKey: false },
  { key: 'jsnext:main', sortSubKey: false },
  { key: 'browser', sortSubKey: false },
  { key: 'types', sortSubKey: false },
  { key: 'typings', sortSubKey: false },
  { key: 'style', sortSubKey: false },
  { key: 'example', sortSubKey: false },
  { key: 'examplestyle', sortSubKey: false },
  { key: 'assets', sortSubKey: false },
  { key: 'bin', sortSubKey: true },
  { key: 'man', sortSubKey: true },
  {
    key: 'directories',
    sortSubKey: true,
    sortList: ['lib', 'bin', 'man', 'doc', 'example'],
  },
  { key: 'workspaces', sortSubKey: false },
  { key: 'scripts', sortSubKey: true, sortScripts: true },
  { key: 'betterScripts', sortSubKey: true, sortScripts: true },
  { key: 'husky', sortSubKey: false },
  { key: 'pre-commit', sortSubKey: false },
  { key: 'commitlint', sortSubKey: true },
  { key: 'lint-staged', sortSubKey: true },
  { key: 'config', sortSubKey: true },
  { key: 'nodemonConfig', sortSubKey: true },
  { key: 'browserify', sortSubKey: true },
  { key: 'babel', sortSubKey: true },
  { key: 'browserslist', sortSubKey: false },
  { key: 'xo', sortSubKey: true },
  { key: 'prettier', sortSubKey: true },
  { key: 'eslintConfig', sortSubKey: true },
  { key: 'eslintIgnore', sortSubKey: false },
  { key: 'stylelint', sortSubKey: false },
  { key: 'ava', sortSubKey: true },
  { key: 'jest', sortSubKey: true },
  { key: 'mocha', sortSubKey: true },
  { key: 'nyc', sortSubKey: true },
  { key: 'dependencies', sortSubKey: true },
  { key: 'devDependencies', sortSubKey: true },
  { key: 'peerDependencies', sortSubKey: true },
  { key: 'bundledDependencies', sortSubKey: true },
  { key: 'bundleDependencies', sortSubKey: true },
  { key: 'optionalDependencies', sortSubKey: true },
  { key: 'flat', sortSubKey: false },
  { key: 'resolutions', sortSubKey: true },
  { key: 'engines', sortSubKey: true },
  { key: 'engineStrict', sortSubKey: true },
  { key: 'os', sortSubKey: true },
  { key: 'cpu', sortSubKey: true },
  { key: 'preferGlobal', sortSubKey: true },
  { key: 'publishConfig', sortSubKey: true },
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

function arrayUnique(array) {
  return array.filter((el, index, arr) => index === arr.indexOf(el))
}

function sortPackageJson(packageJson, options = {}) {
  const determinedSortOrder = options.sortOrder || sortOrder
  let wasString = false
  let hasWindowsNewlines = false
  let endCharacters = ''
  let indentLevel = 2
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

  const prefixedScriptRegex = /^(pre|post)(.)/
  const prefixableScripts = defaultNpmScripts.slice()
  if (typeof packageJson.scripts === 'object') {
    Object.keys(packageJson.scripts).forEach(script => {
      const prefixOmitted = script.replace(prefixedScriptRegex, '$2')
      if (
        packageJson.scripts[prefixOmitted] &&
        !prefixableScripts.includes(prefixOmitted)
      ) {
        prefixableScripts.push(prefixOmitted)
      }
    })
  }

  function sortSubKey({ key, sortSubKey, sortList, sortScripts, unique }) {
    if (!sortSubKey) {
      return
    }

    if (Array.isArray(packageJson[key])) {
      packageJson[key] = packageJson[key].sort()
      if (unique) {
        packageJson[key] = arrayUnique(packageJson[key])
      }
      return
    }

    if (typeof packageJson[key] === 'object') {
      packageJson[key] = sortObjectKeys(
        packageJson[key],
        sortScripts ? compareScriptKeys : sortList,
      )
    }
  }

  function toSortKey(script) {
    const prefixOmitted = script.replace(prefixedScriptRegex, '$2')
    if (prefixableScripts.includes(prefixOmitted)) {
      return prefixOmitted
    }
    return script
  }

  /*             b
   *       pre | * | post
   *   pre  0  | - |  -
   * a  *   +  | 0 |  -
   *   post +  | + |  0
   */
  function compareScriptKeys(a, b) {
    if (a === b) return 0
    const aScript = toSortKey(a)
    const bScript = toSortKey(b)
    if (aScript === bScript) {
      // pre* is always smaller; post* is always bigger
      // Covers: pre* vs. *; pre* vs. post*; * vs. post*
      if (a === `pre${aScript}` || b === `post${bScript}`) return -1
      // The rest is bigger: * vs. *pre; *post vs. *pre; *post vs. *
      return 1
    }
    return aScript < bScript ? -1 : 1
  }

  for (const options of fields) {
    sortSubKey(options)
  }

  packageJson = sortObjectKeys(packageJson, determinedSortOrder)
  if (wasString) {
    let result = JSON.stringify(packageJson, null, indentLevel) + endCharacters
    if (hasWindowsNewlines) {
      result = result.replace(/\n/g, '\r\n')
    }
    return result
  }
  return packageJson
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
