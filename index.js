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
  function sortSubKey(key, sortList) {
    if (Array.isArray(packageJson[key])) {
      packageJson[key] = packageJson[key].sort();
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
  sortSubKey('keywords');
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
    'description',
    'keywords',
    'homepage',
    'bugs',
    'license',
    'author',
    'contributors',
    'files',
    'main',
    'jsnext:main',
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
    'pre-commmit',
    'browser',
    'browserify',
    'babel',
    'eslintConfig',
    'stylelint',
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
    'private',
    'publishConfig',
  ]);
  return wasString ? JSON.stringify(packageJson, null, 2) + endCharacters : packageJson;
}
module.exports = sortPackageJson;
module.exports.sortPackageJson = sortPackageJson;
if (require.main === module) {
  var fs = require('fs');
  var packageJsonPath = process.cwd() + '/package.json';
  var packageJson = fs.readFileSync(packageJsonPath, 'utf8');
  fs.writeFileSync(packageJsonPath, sortPackageJson(packageJson), 'utf8');
  console.log('Ok, your package.json is sorted');
}
