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

const expect = {
  pretest: 'xyz',
  test: 'node test.js',
  posttest: 'abc',
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
  test(field, macro.sortObject, {
    path: field,
    value: fixture,
    expect,
  })
}
