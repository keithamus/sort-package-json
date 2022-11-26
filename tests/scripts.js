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

function sortScriptsWithNpmRunAll(script) {
  const packageJson = {
    scripts: { z: 'z', a: 'a', maybeRunS: script },
    devDependencies: { 'npm-run-all': '^1.0.0' },
  }

  return Object.keys(sortPackageJson(packageJson).scripts)
}
const sortedScripts = ['a', 'maybeRunS', 'z']
const unsortedScripts = ['z', 'a', 'maybeRunS']
// `run-s` command
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
  { script: 'npm-run-all --serial "lint:*"&&foo', expected: unsortedScripts },
  { script: 'npm-run-all --serial "lint:*"|foo', expected: unsortedScripts },
  { script: 'npm-run-all --serial "lint:*"||foo', expected: unsortedScripts },
  { script: 'npm-run-all --serial "lint:*">foo', expected: unsortedScripts },
  { script: 'npm-run-all --serial "lint:*"<foo', expected: unsortedScripts },

  // Should sort
  { script: 'run-s lint:a lint:b', expected: sortedScripts },
  { script: 'not-run-s *', expected: sortedScripts },
  { script: 'npm-run-all * --serial!', expected: sortedScripts },
  { script: 'looks like && run-s-but-its-not *', expected: sortedScripts },
  { script: 'npm-run-all *', expected: sortedScripts },
]) {
  test(`command: '${script}'`, (t) => {
    t.deepEqual(sortScriptsWithNpmRunAll(script), expected)
  })
}
