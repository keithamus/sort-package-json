#!/usr/bin/env node
const sortObjectKeys = require('sort-object-keys')
const detectIndent = require('detect-indent')
const detectNewline = require('detect-newline').graceful
const globby = require('globby')

const onArray = fn => x => (Array.isArray(x) ? fn(x) : x)
const uniq = onArray(xs => xs.filter((x, i) => i === xs.indexOf(x)))
const isPlainObject = x =>
  x && Object.prototype.toString.call(x) === '[object Object]'
const onObject = fn => x => (isPlainObject(x) ? fn(x) : x)
const sortObjectBy = comparator => onObject(x => sortObjectKeys(x, comparator))
const sortObject = sortObjectBy()
const sortURLObject = sortObjectBy(['type', 'url'])
const sortPeopleObject = sortObjectBy(['name', 'email', 'url'])
const sortDirectories = sortObjectBy(['lib', 'bin', 'man', 'doc', 'example'])

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

// field.key{string}: field name
// field.over{function}: sort field subKey
const fields = [
  { key: 'name' },
  { key: 'version' },
  { key: 'private' },
  { key: 'description' },
  { key: 'keywords', over: uniq },
  { key: 'homepage' },
  { key: 'bugs', over: sortObjectBy(['url', 'email']) },
  { key: 'repository', over: sortURLObject },
  { key: 'funding', over: sortURLObject },
  { key: 'license', over: sortURLObject },
  { key: 'author', over: sortPeopleObject },
  {
    key: 'contributors',
    over: onArray(contributors => contributors.map(sortPeopleObject)),
  },
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
  { key: 'man', over: sortObject },
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
  { key: 'husky' },
  { key: 'pre-commit' },
  { key: 'commitlint', over: sortObject },
  { key: 'lint-staged', over: sortObject },
  { key: 'config', over: sortObject },
  { key: 'nodemonConfig', over: sortObject },
  { key: 'browserify', over: sortObject },
  { key: 'babel', over: sortObject },
  { key: 'browserslist' },
  { key: 'xo', over: sortObject },
  { key: 'prettier', over: sortObject },
  { key: 'eslintConfig', over: sortObject },
  { key: 'eslintIgnore' },
  { key: 'stylelint' },
  { key: 'ava', over: sortObject },
  { key: 'jest', over: sortObject },
  { key: 'mocha', over: sortObject },
  { key: 'nyc', over: sortObject },
  { key: 'dependencies', over: sortObject },
  { key: 'devDependencies', over: sortObject },
  { key: 'peerDependencies', over: sortObject },
  { key: 'bundledDependencies', over: sortObject },
  { key: 'bundleDependencies', over: sortObject },
  { key: 'optionalDependencies', over: sortObject },
  { key: 'flat' },
  { key: 'resolutions', over: sortObject },
  { key: 'engines', over: sortObject },
  { key: 'engineStrict', over: sortObject },
  { key: 'os', over: sortObject },
  { key: 'cpu', over: sortObject },
  { key: 'preferGlobal', over: sortObject },
  { key: 'publishConfig', over: sortObject },
]

const sortOrder = fields.map(({ key }) => key)

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

function sortPackageJson(jsonIsh, options = {}) {
  return editStringJSON(
    jsonIsh,
    onObject(json => {
      const newJson = sortObjectKeys(json, options.sortOrder || sortOrder)

      for (const { key, over } of fields) {
        if (over && newJson[key]) newJson[key] = over(newJson[key])
      }

      return newJson
    }),
  )
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

  const files = globby.sync(patterns)

  if (files.length === 0) {
    console.log('No matching files.')
    process.exit(1)
  }

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
    console.log()
    if (notSortedFiles) {
      console.log(
        notSortedFiles === 1
          ? `${notSortedFiles} of ${files.length} matched file is not sorted.`
          : `${notSortedFiles} of ${files.length} matched files are not sorted.`,
      )
    } else {
      console.log(
        files.length === 1
          ? `${files.length} matched file is sorted.`
          : `${files.length} matched files are sorted.`,
      )
    }
    process.exit(notSortedFiles)
  }
}
