import test from 'ava'
import sortPackageJson from '..'
import { macro, keysToObject } from './_helpers'

const fields = [
  'activationEvents',
  'assets',
  'author',
  'ava',
  'babel',
  'badges',
  'betterScripts',
  'bin',
  'binary',
  'browser',
  'browserify',
  'browserslist',
  'bugs',
  'bundleDependencies',
  'bundledDependencies',
  'categories',
  'commitlint',
  'config',
  'contributes',
  'contributors',
  'cpu',
  'dependencies',
  'description',
  'devDependencies',
  'directories',
  'displayName',
  'engineStrict',
  'engines',
  'eslintConfig',
  'eslintIgnore',
  'example',
  'examplestyle',
  'exports',
  'extensionDependencies',
  'extensionPack',
  'files',
  'flat',
  'funding',
  'galleryBanner',
  'homepage',
  'husky',
  'icon',
  'jest',
  'jsdelivr',
  'jsnext:main',
  'keywords',
  'license',
  'lint-staged',
  'main',
  'man',
  'markdown',
  'mocha',
  'module',
  'name',
  'nodemonConfig',
  'nyc',
  'optionalDependencies',
  'os',
  'peerDependencies',
  'pre-commit',
  'preferGlobal',
  'prettier',
  'preview',
  'private',
  'publishConfig',
  'publisher',
  'qna',
  'repository',
  'resolutions',
  'scripts',
  'sideEffects',
  'source',
  'style',
  'stylelint',
  'type',
  'types',
  'typings',
  'umd:main',
  'unpkg',
  'version',
  'workspaces',
  'xo',
]

test('main', t => {
  const packageJson = { version: '1.0.0', name: 'sort-package-json' }

  t.is(
    typeof sortPackageJson(packageJson),
    'object',
    'Accepts object, returns object',
  )
  t.is(
    sortPackageJson(JSON.stringify(packageJson)),
    '{"name":"sort-package-json","version":"1.0.0"}',
    'Accepts string, returns sorted string',
  )

  const array = ['foo', 'bar']
  const string = JSON.stringify(array)
  t.is(sortPackageJson(array), array, 'should not sort object that is an array')
  t.is(
    sortPackageJson(string),
    string,
    'should not sort string that is JSON string of array',
  )
})

test('default sortOrder', macro.sortObject, {
  value: keysToObject(fields),
  expect: 'snapshot',
  message: 'Should sort fields',
})

test('private keys', macro.sortObject, {
  value: keysToObject(['z', '_a', 'name', '_z', 'a']),
  expect: keysToObject(['name', 'a', 'z', '_a', '_z']),
  message: 'Should put private keys at bottom',
})
