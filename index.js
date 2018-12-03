#!/usr/bin/env node
var sortObjectKeys = require('sort-object-keys');
var detectIndent = require('detect-indent');

var sortOrder = [
  'name',
  'version',
  'private',
  'description',
  'keywords',
  'homepage',
  'bugs',
  'repository',
  'license',
  'author',
  'contributors',
  'files',
  'main',
  'module',
  'jsnext:main',
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
  'config',
  'pre-commit',
  'browser',
  'browserify',
  'babel',
  'xo',
  'prettier',
  'eslintConfig',
  'eslintIgnore',
  'stylelint',
  'jest',
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
  'publishConfig',
];
// See https://docs.npmjs.com/misc/scripts
var defaultNpmScripts = [
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
];

function sortPackageJson(packageJson) {
  var wasString = false;
  var endCharacters = '';
  var indentLevel = 2;
  if (typeof packageJson === 'string') {
    wasString = true;
    indentLevel = detectIndent(packageJson).indent;
    if (packageJson.substr(-1) === '\n') {
      endCharacters = '\n';
    }
    packageJson = JSON.parse(packageJson);
  }

  var prefixedScriptRegex = /^(pre|post)(.)/;
  var prefixableScripts = defaultNpmScripts.slice();
  if (typeof packageJson.scripts === 'object') {
    Object.keys(packageJson.scripts).forEach(function (script) {
      var prefixOmitted = script.replace(prefixedScriptRegex, '$2');
      if (packageJson.scripts[prefixOmitted] && prefixableScripts.indexOf(prefixOmitted) < 0) {
        prefixableScripts.push(prefixOmitted);
      }
    });
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
  function toSortKey(script) {
    var prefixOmitted = script.replace(prefixedScriptRegex, '$2');
    if (prefixableScripts.indexOf(prefixOmitted) >= 0) {
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
    var aScript = toSortKey(a);
    var bScript = toSortKey(b);
    if (aScript === bScript) {
      // pre* is always smaller; post* is always bigger
      // Covers: pre* vs. *; pre* vs. post*; * vs. post*
      if (a === 'pre' + aScript || b === 'post' + bScript) return -1;
      // The rest is bigger: * vs. *pre; *post vs. *pre; *post vs. *
      return 1;
    }
    return aScript < bScript ? -1 : 1;
  }
  function array_unique(array) {
    return array.filter(function (el, index, arr) {
      return index == arr.indexOf(el);
    });
  }
  sortSubKey('keywords', null, true);
  sortSubKey('homepage');
  sortSubKey('bugs', [ 'url', 'email' ]);
  sortSubKey('license', [ 'type', 'url' ]);
  sortSubKey('author', [ 'name', 'email', 'url' ]);
  sortSubKey('bin');
  sortSubKey('man');
  sortSubKey('directories', [ 'lib', 'bin', 'man', 'doc', 'example' ]);
  sortSubKey('repository', [ 'type', 'url' ]);
  sortSubKey('scripts', compareScriptKeys);
  sortSubKey('config');
  sortSubKey('browser');
  sortSubKey('browserify');
  sortSubKey('babel');
  sortSubKey('eslintConfig');
  sortSubKey('jest');
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
  packageJson = sortObjectKeys(packageJson, sortOrder);
  return wasString ? JSON.stringify(packageJson, null, indentLevel) + endCharacters : packageJson;
}
module.exports = sortPackageJson;
module.exports.sortPackageJson = sortPackageJson;
module.exports.sortOrder = sortOrder;

if (require.main === module) {
  var fs = require('fs');

  var filesToProcess = process.argv[2] ? process.argv.slice(2) : [process.cwd() + '/package.json'];

  filesToProcess.forEach(function (filePath) {
    var packageJson = fs.readFileSync(filePath, 'utf8');
    var sorted = sortPackageJson(packageJson);
    if (sorted !== packageJson) {
        fs.writeFileSync(filePath, sorted, 'utf8');
        console.log(filePath + ' is sorted!');
    }
  });
}
