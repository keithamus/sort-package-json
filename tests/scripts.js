const test = require('ava')
const { macro } = require('./_helpers')

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
  test(`${field} when npm-run-all is not a dev dependency`, macro.sortObject, {
    value: { [field]: fixture },
    expect: { [field]: expectAllSorted },
  })
  test(`${field} when npm-run-all is a dev dependency`, macro.sortObject, {
    value: {
      [field]: fixture,
      devDependencies: { 'npm-run-all': '^1.0.0' },
    },
    expect: {
      [field]: expectAllSorted,
      devDependencies: { 'npm-run-all': '^1.0.0' },
    },
  })
}
