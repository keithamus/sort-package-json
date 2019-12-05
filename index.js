#!/usr/bin/env node
const sortObjectKeys = require('sort-object-keys');
const detectIndent = require('detect-indent');
const glob = require('glob');

// field.key{string}: field name
// field.sort{boolean|string[]|function}:
//   false: disable field sorting
//   true: sort field keys
//   string[]: key order array
//   function: key compare function
// field.unique{boolean}: unique array values
// field.sortScripts{boolean}: sort field as scripts
const fields = [
  {key: 'name', sort: false},
  {key: 'version', sort: false},
  {key: 'private', sort: true},
  {key: 'description', sort: false},
  {key: 'keywords', unique: true},
  {key: 'homepage', sort: true},
  {key: 'bugs', sort: ['url', 'email']},
  {key: 'repository', sort: ['type', 'url']},
  {key: 'funding', sort: ['type', 'url']},
  {key: 'license', sort: ['type', 'url']},
  {key: 'author', sort: ['name', 'email', 'url']},
  {key: 'contributors', sort: false},
  {key: 'files', sort: false},
  {key: 'sideEffects', sort: false},
  {key: 'type', sort: false},
  {key: 'exports', sort: true},
  {key: 'main', sort: false},
  {key: 'umd:main', sort: false},
  {key: 'jsdelivr', sort: false},
  {key: 'unpkg', sort: false},
  {key: 'module', sort: false},
  {key: 'source', sort: false},
  {key: 'jsnext:main', sort: false},
  {key: 'browser', sort: false},
  {key: 'types', sort: false},
  {key: 'typings', sort: false},
  {key: 'style', sort: false},
  {key: 'example', sort: false},
  {key: 'examplestyle', sort: false},
  {key: 'assets', sort: false},
  {key: 'bin', sort: true},
  {key: 'man', sort: true},
  {key: 'directories', sort: ['lib', 'bin', 'man', 'doc', 'example']},
  {key: 'workspaces', sort: false},
  {key: 'scripts', sortScripts: true},
  {key: 'betterScripts', sortScripts: true},
  {key: 'husky', sort: false},
  {key: 'pre-commit', sort: false},
  {key: 'commitlint', sort: true},
  {key: 'lint-staged', sort: true},
  {key: 'config', sort: true},
  {key: 'nodemonConfig', sort: true},
  {key: 'browserify', sort: true},
  {key: 'babel', sort: true},
  {key: 'browserslist', sort: false},
  {key: 'xo', sort: true},
  {key: 'prettier', sort: true},
  {key: 'eslintConfig', sort: true},
  {key: 'eslintIgnore', sort: false},
  {key: 'stylelint', sort: false},
  {key: 'ava', sort: true},
  {key: 'jest', sort: true},
  {key: 'mocha', sort: true},
  {key: 'nyc', sort: true},
  {key: 'dependencies', sort: true},
  {key: 'devDependencies', sort: true},
  {key: 'peerDependencies', sort: true},
  {key: 'bundledDependencies', sort: true},
  {key: 'bundleDependencies', sort: true},
  {key: 'optionalDependencies', sort: true},
  {key: 'flat', sort: false},
  {key: 'resolutions', sort: true},
  {key: 'engines', sort: true},
  {key: 'engineStrict', sort: true},
  {key: 'os', sort: true},
  {key: 'cpu', sort: true},
  {key: 'preferGlobal', sort: true},
  {key: 'publishConfig', sort: true},
];

const sortOrder = fields.map(({key}) => key);

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
    key,
    sort,
    sortScripts,
    unique
  }) {
    if (sort === false) {
      return
    }

    if (Array.isArray(packageJson[key])) {
      packageJson[key] = packageJson[key].sort();
      if (unique) {
        packageJson[key] = array_unique(packageJson[key]);
      }
      return;
    }

    if (typeof packageJson[key] === 'object') {
      let sortList
      if (sortScripts) {
        sortList = compareScriptKeys
      } else if (Array.isArray(sort)) {
        sortList = sort
      }
      packageJson[key] = sortObjectKeys(packageJson[key], sortList);
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

  for (const options of fields) {
    sortSubKey(options);
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
  const isCheckFlag = argument => argument === '--check' || argument === '-c';

  const cliArguments = process.argv.slice(2);
  const isCheck = cliArguments.some(isCheckFlag);

  const patterns = cliArguments.filter(argument => !isCheckFlag(argument));

  if (!patterns.length) {
    patterns[0] = 'package.json';
  }

  const files = patterns.reduce(
    (files, pattern) => files.concat(glob.sync(pattern)),
    []
  );

  let notSortedFiles = 0;

  files.forEach(file => {
    const packageJson = fs.readFileSync(file, 'utf8');
    const sorted = sortPackageJson(packageJson);

    if (sorted !== packageJson) {
      if (isCheck) {
        notSortedFiles ++;
        console.log(file);
      } else {
        fs.writeFileSync(file, sorted, 'utf8');
        console.log(`${file} is sorted!`);
      }
    }
  });

  if (isCheck) {
    if (notSortedFiles) {
      console.log(
        notSortedFiles === 1 ?
        `${notSortedFiles} file is not sorted.`:
        `\n ${notSortedFiles} files are not sorted.`
      );
    } else {
      console.log(
        files.length === 1 ?
        `file is sorted.`:
        `all files are sorted.`
      );
    }
    process.exit(notSortedFiles)
  }
}
