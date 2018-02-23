#!/usr/bin/env node
var sortObjectKeys = require('sort-object-keys');
function sortPackageJson(packageJson) {
  var wasString = false;
  var endCharacters = '';
  if (typeof packageJson === 'string') {
    wasString = true;
    if (packageJson.substr(-1) === '\n') {
      endCharacters = '\n';
    }
    packageJson = JSON.parse(packageJson);
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
  /*             b
   *       pre | * | post
   *   pre  0  | - |  -
   * a  *   +  | 0 |  -
   *   post +  | + |  0
   */
  function compareScriptKeys(a, b) {
    if (a === b) return 0;
    var aScript = a.replace(/^(pre|post)(.)/, '$2');
    var bScript = b.replace(/^(pre|post)(.)/, '$2');
    if (aScript === bScript) {
      // pre* is always smaller; post* is always bigger
      // Covers: pre* vs. *; pre* vs. post*; * vs. post*
      if (a.indexOf('pre') === 0 || b.indexOf('post') === 0) return -1;
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
  sortSubKey('prettier');
  sortSubKey('dependencies');
  sortSubKey('devDependencies');
  sortSubKey('peerDependencies');
  sortSubKey('bundledDependencies');
  sortSubKey('bundleDependencies');
  sortSubKey('optionalDependencies');
  sortSubKey('engines');
  sortSubKey('engineStrict');
  sortSubKey('os');
  sortSubKey('cpu');
  sortSubKey('preferGlobal');
  sortSubKey('private');
  sortSubKey('publishConfig');
  packageJson = sortObjectKeys(packageJson, [
    'name',
    'version',
    'private',
    'description',
    'keywords',
    'homepage',
    'bugs',
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
    'repository',
    'scripts',
    'config',
    'pre-commit',
    'browser',
    'browserify',
    'babel',
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
    'engines',
    'engineStrict',
    'os',
    'cpu',
    'preferGlobal',
    'publishConfig',
  ]);
  return wasString ? JSON.stringify(packageJson, null, 2) + endCharacters : packageJson;
}
module.exports = sortPackageJson;
module.exports.sortPackageJson = sortPackageJson;

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
