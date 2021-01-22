const test = require('ava')
const sortPackageJson = require('..')
const { macro } = require('./_helpers')

const fixture = {
  test: 'node test.js',
  multiply: '2 * 3', // between p(ostinstall) and install
  watch: 'watch things',
  prewatch: 'echo "about to watch"',
  postinstall: 'echo "Installed"',
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
  test(field, macro.sortObject, {
    path: field,
    value: fixture,
    expect: expect,
  })

  test(`${field} with npm-run-all`, (t) => {
    const packageJson = {
      [field]: fixture,
      devDependencies: {
        'npm-run-all': '*',
      },
    }

    t.is(
      sortPackageJson(JSON.stringify(packageJson)),
      JSON.stringify(packageJson),
    )
  })
}
