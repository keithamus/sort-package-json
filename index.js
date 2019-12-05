#!/usr/bin/env node
const sortObjectKeys = require('sort-object-keys');
const detectIndent = require('detect-indent');
const glob = require('glob');

const fields = [
  {field: 'name', sort: false},
  {field: 'version', sort: false},
  {field: 'private', sort: true},
  {field: 'description', sort: false},
  {field: 'keywords', unique: true},
  {field: 'homepage', sort: true},
  {field: 'bugs', sort: ['url', 'email']},
  {field: 'repository', sort: ['type', 'url']},
  {field: 'funding', sort: ['type', 'url']},
  {field: 'license', sort: ['type', 'url']},
  {field: 'author', sort: ['name', 'email', 'url']},
  {field: 'contributors', sort: false},
  {field: 'files', sort: false},
  {field: 'sideEffects', sort: false},
  {field: 'type', sort: false},
  {field: 'exports', sort: true},
  {field: 'main', sort: false},
  {field: 'umd:main', sort: false},
  {field: 'jsdelivr', sort: false},
  {field: 'unpkg', sort: false},
  {field: 'module', sort: false},
  {field: 'source', sort: false},
  {field: 'jsnext:main', sort: false},
  {field: 'browser', sort: false},
  {field: 'types', sort: false},
  {field: 'typings', sort: false},
  {field: 'style', sort: false},
  {field: 'example', sort: false},
  {field: 'examplestyle', sort: false},
  {field: 'assets', sort: false},
  {field: 'bin', sort: true},
  {field: 'man', sort: true},
  {field: 'directories', sort: ['lib', 'bin', 'man', 'doc', 'example']},
  {field: 'workspaces', sort: false},
  {field: 'scripts', sortScript: true},
  {field: 'betterScripts', sortScript: true},
  {field: 'husky', sort: false},
  {field: 'pre-commit', sort: false},
  {field: 'commitlint', sort: true},
  {field: 'lint-staged', sort: true},
  {field: 'config', sort: true},
  {field: 'nodemonConfig', sort: true},
  {field: 'browserify', sort: true},
  {field: 'babel', sort: true},
  {field: 'browserslist', sort: false},
  {field: 'xo', sort: true},
  {field: 'prettier', sort: true},
  {field: 'eslintConfig', sort: true},
  {field: 'eslintIgnore', sort: false},
  {field: 'stylelint', sort: false},
  {field: 'ava', sort: true},
  {field: 'jest', sort: true},
  {field: 'mocha', sort: true},
  {field: 'nyc', sort: true},
  {field: 'dependencies', sort: true},
  {field: 'devDependencies', sort: true},
  {field: 'peerDependencies', sort: true},
  {field: 'bundledDependencies', sort: true},
  {field: 'bundleDependencies', sort: true},
  {field: 'optionalDependencies', sort: true},
  {field: 'flat', sort: false},
  {field: 'resolutions', sort: true},
  {field: 'engines', sort: true},
  {field: 'engineStrict', sort: true},
  {field: 'os', sort: true},
  {field: 'cpu', sort: true},
  {field: 'preferGlobal', sort: true},
  {field: 'publishConfig', sort: true},
];

const sortOrder = fields.map(({field}) => field);

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
    sort,
    sortScript,
    unique
  }) {
    if (sort === false) {
      return
    }

    if (Array.isArray(packageJson[field])) {
      packageJson[field] = packageJson[field].sort();
      if (unique) {
        packageJson[field] = array_unique(packageJson[field]);
      }
      return;
    }

    if (typeof packageJson[field] === 'object') {
      let sortList
      if (sortScript) {
        sortList = compareScriptKeys
      } else if (Array.isArray(sort)) {
        sortList = sort
      }
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
