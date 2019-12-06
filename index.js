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
  'exports',
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
  'mocha',
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
  function getPrefixableScripts(key) {
    const scripts = packageJson[key]
    const prefixableScripts = defaultNpmScripts.slice();
    if (typeof scripts === 'object') {
      Object.keys(scripts).forEach(script => {
        const prefixOmitted = script.replace(prefixedScriptRegex, '$2');
        if (
          scripts[prefixOmitted] &&
          !prefixableScripts.includes(prefixOmitted)
        ) {
          prefixableScripts.push(prefixOmitted);
        }
      });
    }
    return prefixableScripts
  }

  function sortSubKey(key, sortList, unique) {
    if (Array.isArray(packageJson[key])) {
      packageJson[key] = packageJson[key].sort();
      if (unique) {
        packageJson[key] = array_unique(packageJson[key]);
      }
      return;
    }
    if (typeof packageJson[key] === 'object') {
      packageJson[key] = sortObjectKeys(packageJson[key], sortList);
    }
  }
  function toSortKey(prefixableScripts, script) {
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
  function getCompareScriptKeys(key) {
    const prefixableScripts = getPrefixableScripts(key);

    return (a, b) => {
      if (a === b) return 0;
      const aScript = toSortKey(prefixableScripts, a);
      const bScript = toSortKey(prefixableScripts, b);
      if (aScript === bScript) {
        // pre* is always smaller; post* is always bigger
        // Covers: pre* vs. *; pre* vs. post*; * vs. post*
        if (a === `pre${aScript}` || b === `post${bScript}`) return -1;
        // The rest is bigger: * vs. *pre; *post vs. *pre; *post vs. *
        return 1;
      }
      return aScript < bScript ? -1 : 1;

    }
  }
  function array_unique(array) {
    return array.filter((el, index, arr) => index == arr.indexOf(el));
  }
  sortSubKey('keywords', null, true);
  sortSubKey('homepage');
  sortSubKey('bugs', ['url', 'email']);
  sortSubKey('license', ['type', 'url']);
  sortSubKey('author', ['name', 'email', 'url']);
  sortSubKey('exports');
  sortSubKey('bin');
  sortSubKey('man');
  sortSubKey('directories', ['lib', 'bin', 'man', 'doc', 'example']);
  sortSubKey('repository', ['type', 'url']);
  sortSubKey('funding', ['type', 'url']);
  sortSubKey('scripts', getCompareScriptKeys('scripts'));
  sortSubKey('betterScripts', getCompareScriptKeys('betterScripts'));
  sortSubKey('commitlint');
  sortSubKey('lint-staged');
  sortSubKey('config');
  sortSubKey('nodemonConfig');
  sortSubKey('browserify');
  sortSubKey('babel');
  sortSubKey('eslintConfig');
  sortSubKey('ava');
  sortSubKey('jest');
  sortSubKey('mocha');
  sortSubKey('nyc');
  sortSubKey('xo');
  sortSubKey('prettier');
  sortSubKey('dependencies');
  sortSubKey('devDependencies');
  sortSubKey('peerDependencies');
  sortSubKey('bundledDependencies');
  sortSubKey('bundleDependencies');
  sortSubKey('optionalDependencies');
  sortSubKey('resolutions');
  sortSubKey('engines');
  sortSubKey('engineStrict');
  sortSubKey('os');
  sortSubKey('cpu');
  sortSubKey('preferGlobal');
  sortSubKey('private');
  sortSubKey('publishConfig');
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
