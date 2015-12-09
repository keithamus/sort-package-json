#!/usr/bin/env node
var sortObjectKeys = require('sort-object-keys');
function sortPackageJson(packageJson) {
  var wasString = false;
  if (typeof packageJson === 'string') {
    wasString = true;
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
  sortSubKey('keywords');
  sortSubKey('homepage');
  sortSubKey('bugs', [ 'url', 'email' ]);
  sortSubKey('license', [ 'type', 'url' ]);
  sortSubKey('author', [ 'name', 'email', 'url' ]);
  sortSubKey('bin');
  sortSubKey('man');
  sortSubKey('directories', [ 'lib', 'bin', 'man', 'doc', 'example' ]);
  sortSubKey('repository', [ 'type', 'url' ]);
  sortSubKey('scripts');
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
    'style',
    'example',
    'examplestyle',
    'bin',
    'man',
    'directories',
    'repository',
    'scripts',
    'config',
    'browser',
    'browserify',
    'babel',
    'eslintConfig',
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
  return wasString ? JSON.stringify(packageJson, null, 2) : packageJson;
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
