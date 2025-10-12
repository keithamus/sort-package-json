import test from 'ava'
import sortPackageJson from '../index.js'
import { macro } from './_helpers.js'

const fixture = {
  test: 'node test.js',
  multiply: '2 * 3', // between p(ostinstall) and install
  watch: 'watch things',
  prewatch: 'echo "about to watch"',
  postinstall: 'echo "Installed"',
  preinstall: 'echo "Installing"',
  start: 'node server.js',
  posttest: 'abc',
  pretest: 'xyz',
  postprettier: 'echo "so pretty"',
  preprettier: 'echo "not pretty"',
  prettier: 'prettier -l "**/*.js"',
  prepare: 'npm run build',
  'pre-fetch-info': 'foo',
}

const expectAllSorted = {
  preinstall: 'echo "Installing"',
  postinstall: 'echo "Installed"',
  multiply: '2 * 3',
  'pre-fetch-info': 'foo',
  prepare: 'npm run build',
  preprettier: 'echo "not pretty"',
  prettier: 'prettier -l "**/*.js"',
  postprettier: 'echo "so pretty"',
  start: 'node server.js',
  pretest: 'xyz',
  test: 'node test.js',
  posttest: 'abc',
  prewatch: 'echo "about to watch"',
  watch: 'watch things',
}

for (const field of ['scripts', 'betterScripts']) {
  test(`${field} when npm-run-all is NOT a dev dependency`, macro.sortObject, {
    value: { [field]: fixture },
    expect: { [field]: expectAllSorted },
  })

  test(
    `${field} when npm-run-all IS a dev dependency, but is NOT used in scripts`,
    macro.sortObject,
    {
      value: {
        [field]: { z: 'z', a: 'a' },
        devDependencies: { 'npm-run-all': '^1.0.0' },
      },
      expect: {
        [field]: { a: 'a', z: 'z' },
        devDependencies: { 'npm-run-all': '^1.0.0' },
      },
    },
  )
}

// `run-s` command
function sortScriptsWithNpmRunAll(script) {
  const packageJson = {
    scripts: { z: 'z', a: 'a', maybeRunS: script },
    devDependencies: { 'npm-run-all': '^1.0.0' },
  }

  return Object.keys(sortPackageJson(packageJson).scripts)
}
function sortScriptsWithNpmRunAll2(script) {
  const packageJson = {
    scripts: { z: 'z', a: 'a', maybeRunS: script },
    devDependencies: { 'npm-run-all2': '^1.0.0' },
  }

  return Object.keys(sortPackageJson(packageJson).scripts)
}

const sortedScripts = ['a', 'maybeRunS', 'z']
const unsortedScripts = ['z', 'a', 'maybeRunS']
for (const { script, expected } of [
  // Should NOT sort
  { script: 'run-s "lint:*"', expected: unsortedScripts },
  { script: 'npm-run-all -s "lint:*"', expected: unsortedScripts },
  { script: 'npm-run-all --sequential "lint:*"', expected: unsortedScripts },
  { script: 'npm-run-all --serial "lint:*"', expected: unsortedScripts },
  { script: 'npm-run-all "lint:*" --sequential', expected: unsortedScripts },
  { script: 'foo&&npm-run-all --serial "lint:*"', expected: unsortedScripts },
  { script: 'foo||npm-run-all --serial "lint:*"', expected: unsortedScripts },
  { script: 'foo|npm-run-all --serial "lint:*"', expected: unsortedScripts },
  { script: 'foo>npm-run-all --serial "lint:*"', expected: unsortedScripts },
  { script: 'foo<npm-run-all --serial "lint:*"', expected: unsortedScripts },
  {
    script: 'cross-env FOO=1 npm-run-all --serial "lint:*"',
    expected: unsortedScripts,
  },
  { script: 'npm-run-all "lint:*" --serial&&foo', expected: unsortedScripts },
  { script: 'npm-run-all "lint:*" --serial|foo', expected: unsortedScripts },
  { script: 'npm-run-all "lint:*" --serial||foo', expected: unsortedScripts },
  { script: 'npm-run-all "lint:*" --serial>foo', expected: unsortedScripts },
  { script: 'npm-run-all "lint:*" --serial<foo', expected: unsortedScripts },
  { script: 'npm-run-all --serial "lint:*"&&foo', expected: unsortedScripts },
  { script: 'npm-run-all "lint:*" --serial;foo', expected: unsortedScripts },
  { script: '(npm-run-all "lint:*" --serial)|foo', expected: unsortedScripts },

  // Should sort
  { script: 'run-s lint:a lint:b', expected: sortedScripts },
  { script: 'not-run-s *', expected: sortedScripts },
  { script: 'npm-run-all * --serial!', expected: sortedScripts },
  { script: 'looks like && run-s-but-its-not *', expected: sortedScripts },
  { script: 'npm-run-all *', expected: sortedScripts },
  { script: 'npm-run-all --parallel watch:*', expected: sortedScripts },

  // False positive
  { script: 'rm -rf dist/* && run-s lint:a lint:b', expected: unsortedScripts },
]) {
  test(`command: '${script}'`, (t) => {
    t.deepEqual(sortScriptsWithNpmRunAll(script), expected)
  })

  test(`command: '${script}' with npm-run-all2`, (t) => {
    t.deepEqual(sortScriptsWithNpmRunAll2(script), expected)
  })
}

for (const field of ['scripts', 'betterScripts']) {
  test(`${field} when npm-run-all2 is not a dev dependency`, macro.sortObject, {
    value: { [field]: fixture },
    expect: { [field]: expectAllSorted },
  })
  test(`${field} when npm-run-all2 is a dev dependency`, macro.sortObject, {
    value: {
      [field]: fixture,
      devDependencies: { 'npm-run-all2': '^1.0.0' },
    },
    expect: {
      [field]: expectAllSorted,
      devDependencies: { 'npm-run-all2': '^1.0.0' },
    },
  })
}

// npm-run-all2
for (const { script, expected } of [
  // Should NOT sort
  { script: 'npm-run-all2 -s "lint:*"', expected: unsortedScripts },
]) {
  test(`command: '${script}' with npm-run-all2`, (t) => {
    t.deepEqual(sortScriptsWithNpmRunAll2(script), expected)
  })
}

for (const field of ['scripts', 'betterScripts']) {
  test(
    `${field} does not sort pre/post scripts with colon together`,
    macro.sortObject,
    {
      value: {
        [field]: {
          prebuild: 'run-s prebuild:*',
          'prebuild:1': 'node prebuild.js 1',
          'prebuild:2': 'node prebuild.js 2',
          'prebuild:3': 'node prebuild.js 3',
          build: 'run-s build:*',
          'build:bar': 'node bar.js',
          'build:baz': 'node baz.js',
          'build:foo': 'node foo.js',
          postbuild: 'run-s prebuild:*',
          'postbuild:1': 'node prebuild.js 1',
          'postbuild:2': 'node prebuild.js 2',
          'postbuild:3': 'node prebuild.js 3',
          'd-unrelated': '..',
          'e-unrelated': '..',
          'f-unrelated': '..',
        },
      },
      expect: {
        [field]: {
          prebuild: 'run-s prebuild:*',
          build: 'run-s build:*',
          postbuild: 'run-s prebuild:*',
          'build:bar': 'node bar.js',
          'build:baz': 'node baz.js',
          'build:foo': 'node foo.js',
          'd-unrelated': '..',
          'e-unrelated': '..',
          'f-unrelated': '..',
          'postbuild:1': 'node prebuild.js 1',
          'postbuild:2': 'node prebuild.js 2',
          'postbuild:3': 'node prebuild.js 3',
          'prebuild:1': 'node prebuild.js 1',
          'prebuild:2': 'node prebuild.js 2',
          'prebuild:3': 'node prebuild.js 3',
        },
      },
    },
  )
}

for (const field of ['scripts', 'betterScripts']) {
  test(
    `${field} sort pre/post scripts together with base script independent of colon in name`,
    macro.sortObject,
    {
      value: {
        [field]: {
          'pretest:es-check': 'echo',
          'posttest:es-check': 'echo',
          test: 'echo',
          'test:coverage': 'echo',
          'test:es-check': 'echo',
          'test:types': 'echo',
        },
      },
      expect: {
        [field]: {
          test: 'echo',
          'test:coverage': 'echo',
          'pretest:es-check': 'echo',
          'test:es-check': 'echo',
          'posttest:es-check': 'echo',
          'test:types': 'echo',
        },
      },
    },
  )
}

test('scripts: group base and colon scripts together, do not split with unrelated', (t) => {
  const input = {
    scripts: {
      test: 'run-s test:a test:b',
      'test:a': 'foo',
      'test:b': 'bar',
      'test-coverage': 'c8 node --run test',
    },
  }
  const sorted = sortPackageJson(input)
  t.deepEqual(Object.keys(sorted.scripts), [
    'test',
    'test:a',
    'test:b',
    'test-coverage',
  ])
})

test('scripts: group scripts with multiple colons', (t) => {
  const input = {
    scripts: {
      test: 'run-s test:a test:b',
      'test:a': 'foo',
      'test:b': 'bar',
      'test:a:a': 'foofoo',
      'test:a:b': 'foobar',
      'test:a-coverage': 'foobar',
      'test:b:a': 'barfoo',
      'test:b:b': 'barbar',
      'test-coverage': 'c8 node --run test',
    },
  }
  const sorted = sortPackageJson(input)
  t.deepEqual(Object.keys(sorted.scripts), [
    'test',
    'test:a',
    'test:a:a',
    'test:a:b',
    'test:b',
    'test:b:a',
    'test:b:b',
    'test-coverage',
  ])
})
