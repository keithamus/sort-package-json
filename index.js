#!/usr/bin/env node
const sortObjectKeys = require('sort-object-keys');
const detectIndent = require('detect-indent');
const glob = require('glob');

const sortOrder = [
  'name',
  'version',
  'private',
  'description',
  'keywords',
  'homepage',
  'bugs',
  'repository',
  'funding',
  'license',
  'author',
  'contributors',
  'files',
  'sideEffects',
  'type',
  'main',
  'umd:main',
  'jsdelivr',
  'unpkg',
  'module',
  'source',
  'jsnext:main',
  'browser',
  'types',
  'typings',
  'style',
  'example',
  'examplestyle',
  'assets',
  'bin',
  'man',
  'directories',
  'workspaces',
  'scripts',
  'betterScripts',
  'husky',
  'pre-commit',
  'commitlint',
  'lint-staged',
  'config',
  'nodemonConfig',
  'browserify',
  'babel',
  'browserslist',
  'xo',
  'prettier',
  'eslintConfig',
  'eslintIgnore',
  'stylelint',
  'ava',
  'jest',
  'nyc',
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'bundledDependencies',
  'bundleDependencies',
  'optionalDependencies',
  'flat',
  'resolutions',
  'engines',
  'engineStrict',
  'os',
  'cpu',
  'preferGlobal',
  'publishConfig'
];
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
  'version'
];

function sortPackageJson(packageJson, options = {}) {
  const determinedSortOrder = options.sortOrder || sortOrder;
  let wasString = false;
  let hasWindowsNewlines = false;
  let endCharacters = '';
  let indentLevel = 2;
  if (typeof packageJson === 'string') {
    wasString = true;
    indentLevel = detectIndent(packageJson).indent;
    if (packageJson.substr(-1) === '\n') {
      endCharacters = '\n';
    }
    const newlineMatch = packageJson.match(/(\r?\n)/);
    hasWindowsNewlines = (newlineMatch && newlineMatch[0]) === '\r\n';
    packageJson = JSON.parse(packageJson);
  }

  const prefixedScriptRegex = /^(pre|post)(.)/;
  const prefixableScripts = defaultNpmScripts.slice();
  if (typeof packageJson.scripts === 'object') {
    Object.keys(packageJson.scripts).forEach(script => {
      const prefixOmitted = script.replace(prefixedScriptRegex, '$2');
      if (
        packageJson.scripts[prefixOmitted] &&
        !prefixableScripts.includes(prefixOmitted)
      ) {
        prefixableScripts.push(prefixOmitted);
      }
    });
  }

  function sortSubKey({
    field,
    sortList,
    unique
  }) {
    if (Array.isArray(packageJson[field])) {
      packageJson[field] = packageJson[field].sort();
      if (unique) {
        packageJson[field] = array_unique(packageJson[field]);
      }
      return;
    }
    if (typeof packageJson[field] === 'object') {
      packageJson[field] = sortObjectKeys(packageJson[field], sortList);
    }
  }
  function toSortKey(script) {
    const prefixOmitted = script.replace(prefixedScriptRegex, '$2');
    if (prefixableScripts.includes(prefixOmitted)) {
      return prefixOmitted;
    }
    return script;
  }
  /*             b
   *       pre | * | post
   *   pre  0  | - |  -
   * a  *   +  | 0 |  -
   *   post +  | + |  0
   */
  function compareScriptKeys(a, b) {
    if (a === b) return 0;
    const aScript = toSortKey(a);
    const bScript = toSortKey(b);
    if (aScript === bScript) {
      // pre* is always smaller; post* is always bigger
      // Covers: pre* vs. *; pre* vs. post*; * vs. post*
      if (a === `pre${aScript}` || b === `post${bScript}`) return -1;
      // The rest is bigger: * vs. *pre; *post vs. *pre; *post vs. *
      return 1;
    }
    return aScript < bScript ? -1 : 1;
  }
  function array_unique(array) {
    return array.filter((el, index, arr) => index == arr.indexOf(el));
  }

  const sortFields = [
    {
      field: 'keywords',
      sortList: null,
      unique: true
    },
    'homepage',
    {
      field: 'bugs',
      sortList: ['url', 'email']
    },
    {
      field: 'license',
      sortList: ['type', 'url']
    },
    {
      field: 'author',
      sortList: ['name', 'email', 'url']
    },
    'bin',
    'man',
    {
      field: 'directories',
      sortList: ['lib', 'bin', 'man', 'doc', 'example']
    },
    {
      field: 'repository',
      sortList: ['type', 'url']
    },
    {
      field: 'funding',
      sortList: ['type', 'url']
    },
    {
      field: 'scripts',
      sortList: compareScriptKeys
    },
    {
      field: 'betterScripts',
      sortList: compareScriptKeys
    },
    'commitlint',
    'lint-staged',
    'config',
    'nodemonConfig',
    'browserify',
    'babel',
    'eslintConfig',
    'ava',
    'jest',
    'nyc',
    'xo',
    'prettier',
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'bundledDependencies',
    'bundleDependencies',
    'optionalDependencies',
    'resolutions',
    'engines',
    'engineStrict',
    'os',
    'cpu',
    'preferGlobal',
    'private',
    'publishConfig'
  ].map(options => typeof options === 'string' ? {field: options} : options);

  for (const sortOptions of sortFields) {
    sortSubKey(sortOptions);
  }

  packageJson = sortObjectKeys(packageJson, determinedSortOrder);
  if (wasString) {
    let result = JSON.stringify(packageJson, null, indentLevel) + endCharacters;
    if (hasWindowsNewlines) {
      result = result.replace(/\n/g, '\r\n');
    }
    return result;
  }
  return packageJson;
}
module.exports = sortPackageJson;
module.exports.sortPackageJson = sortPackageJson;
module.exports.sortOrder = sortOrder;

if (require.main === module) {
  const fs = require('fs');

  const paths = process.argv[2]
    ? process.argv.slice(2)
    : [`${process.cwd()}/package.json`];

  paths.forEach(path => {
    const filesToProcess = glob.sync(path);
    filesToProcess.forEach(filePath => {
      const packageJson = fs.readFileSync(filePath, 'utf8');
      const sorted = sortPackageJson(packageJson);
      if (sorted !== packageJson) {
        fs.writeFileSync(filePath, sorted, 'utf8');
        console.log(`${filePath} is sorted!`);
      }
    });
  });
}
