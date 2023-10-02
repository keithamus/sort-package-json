import test from 'ava'
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

const fixtureWithRunS = {
  test: 'node test.js',
  multiply: '2 * 3', // between p(ostinstall) and install
  watch: 'watch things',
  prewatch: 'echo "about to watch"',
  postinstall: 'echo "Installed"',
  preinstall: 'echo "Installing"',
  start: 'node server.js',
  posttest: 'run-s abc def',
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

const expectPreAndPostSorted = {
  pretest: 'xyz',
  test: 'node test.js',
  posttest: 'run-s abc def',
  multiply: '2 * 3',
  prewatch: 'echo "about to watch"',
  watch: 'watch things',
  preinstall: 'echo "Installing"',
  postinstall: 'echo "Installed"',
  start: 'node server.js',
  preprettier: 'echo "not pretty"',
  prettier: 'prettier -l "**/*.js"',
  postprettier: 'echo "so pretty"',
  prepare: 'npm run build',
  'pre-fetch-info': 'foo',
}

for (const field of ['scripts', 'betterScripts']) {
  test(`${field} when npm-run-all is NOT a dev dependency`, macro.sortObject, {
    value: { [field]: fixture },
    expect: { [field]: expectAllSorted },
  })

  for (const type of ['run-s']) {
    test(
      `${field} when npm-run-all IS a dev dependency, and IS used in scripts in form of ${type}`,
      macro.sortObject,
      {
        value: {
          [field]: fixtureWithRunS,
          devDependencies: { 'npm-run-all': '^1.0.0' },
        },
        expect: {
          [field]: expectPreAndPostSorted,
          devDependencies: { 'npm-run-all': '^1.0.0' },
        },
      },
    )
  }
  test(
    `${field} when npm-run-all IS a dev dependency, but is NOT used in scripts`,
    macro.sortObject,
    {
      value: {
        [field]: fixture,
        devDependencies: { 'npm-run-all': '^1.0.0' },
      },
      expect: {
        [field]: expectAllSorted,
        devDependencies: { 'npm-run-all': '^1.0.0' },
      },
    },
  )
}
