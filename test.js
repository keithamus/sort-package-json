const assert = require('assert')
const fs = require('fs')
const newline = require('newline')
const sortPackageJson = require('./')
const { execFile } = require('child_process')

const UNKNOWN = 'UNKNOWN_KEY_OR_VALUE'
function testField(name, tests, options) {
  for (const { value, expect, message } of tests) {
    const packageJson = {
      [name]: value,
    }
    const input = JSON.stringify(packageJson, null, 2)
    const sorted = sortPackageJson(packageJson, options)
    const output = JSON.stringify(sorted, null, 2)

    const defaultMessage = `Should sort \`${name}\` field in order of:
${JSON.stringify(expect, null, 2)}.
`

    const detail = `
Input:
${input}

Output:
${output}

Message:
${message || defaultMessage}
`

    if (Array.isArray(value)) {
      assert.deepStrictEqual(sorted[name], expect, detail)
    } else if (value && typeof value === 'object') {
      assert.deepStrictEqual(Object.keys(sorted[name]), expect, detail)
    }
  }
}

fs.readFile('./package.json', 'utf8', (error, contents) => {
  if (error) {
    console.error(error.stack || error)
    process.exit(1)
  }

  // Enforce LF line-endings. Windows git users often set core.autocrlf
  // to true, so the file may have CRLF line endings.
  contents = newline.set(contents, 'LF')

  const parsed = JSON.parse(contents)
  assert.deepStrictEqual(
    typeof sortPackageJson(parsed),
    'object',
    'Accepts object, returns object',
  )
  assert.strictEqual(
    `${JSON.stringify(sortPackageJson(parsed), null, 2)}\n`,
    contents,
    'Returned object is sorted',
  )
  assert.strictEqual(
    sortPackageJson(contents),
    contents,
    'Accepts string, returns sorted string',
  )

  assert.strictEqual(
    JSON.stringify(
      sortPackageJson({
        dependencies: {},
        version: '1.0.0',
        keywords: ['thing'],
        name: 'foo',
        private: true,
      }),
    ),
    '{"name":"foo","version":"1.0.0","private":true,"keywords":["thing"],"dependencies":{}}',
  )

  // Custom sort order
  assert.deepStrictEqual(
    Object.keys(
      sortPackageJson(
        {
          name: 'my-package',
          a: 'a',
          z: 'z',
        },
        {
          sortOrder: ['z', 'a', 'name'],
        },
      ),
    ),
    ['z', 'a', 'name'],
  )

  // Custom sort order should not effect field sorting
  assert.deepStrictEqual(
    Object.keys(
      sortPackageJson(
        {
          scripts: {
            name: 'my-package',
            a: 'a',
            z: 'z',
          },
        },
        {
          sortOrder: ['z', 'a', 'name'],
        },
      ).scripts,
    ),
    ['a', 'name', 'z'],
  )

  assert.strictEqual(sortPackageJson('{}'), '{}')
  assert.strictEqual(sortPackageJson('{}\n'), '{}\n')
  assert.strictEqual(sortPackageJson('{}\r\n'), '{}\r\n')
  assert.strictEqual(sortPackageJson('{"foo":"bar"}\n'), '{"foo":"bar"}\n')

  assert.strictEqual(
    sortPackageJson('{\n  "foo": "bar"\n}\n'),
    '{\n  "foo": "bar"\n}\n',
  )
  assert.strictEqual(
    sortPackageJson('{\n     "name": "foo",\n "version": "1.0.0"\n}'),
    '{\n     "name": "foo",\n     "version": "1.0.0"\n}',
  )
  assert.strictEqual(
    sortPackageJson('{\r\n  "foo": "bar"\r\n}\r\n'),
    '{\r\n  "foo": "bar"\r\n}\r\n',
  )
})

// fields tests

// fields sort as object
for (const field of [
  'exports',
  'bin',
  'man',
  'commitlint',
  'lint-staged',
  'config',
  'nodemonConfig',
  'browserify',
  'babel',
  'xo',
  'prettier',
  'eslintConfig',
  'ava',
  'jest',
  'mocha',
  'nyc',
  'resolutions',
  'engines',
  'engineStrict',
  'os',
  'cpu',
  'preferGlobal',
  'publishConfig',
]) {
  testField(field, [
    {
      value: ['foo', 'bar'],
      expect: ['foo', 'bar'],
      message: `Should ignore \`${field}\` field that is not plain object.`,
    },
    {
      value: {
        foo: 'foo',
        bar: 'bar',
      },
      expect: ['bar', 'foo'],
      message: `Should sort \`${field}\` field.`,
    },
  ])
}

// simple disabled subKey sorting test
for (const field of [
  'name',
  'version',
  'description',
  'contributors',
  'sideEffects',
  'files',
  'keywords',
  'type',
  'main',
  'umd:main',
  'jsdelivr',
  'unpkg',
  'module',
  'source',
  'jsnext:main',
  'browser',
  'types',
  'typings',
  'style',
  'example',
  'examplestyle',
  'assets',
  'workspaces',
  'husky',
  'pre-commit',
  'browserslist',
  'eslintIgnore',
  'stylelint',
  'flat',
]) {
  testField(field, [
    {
      value: ['foo', 'bar'],
      expect: ['foo', 'bar'],
      message: `Should not sort \`${field}\` field.`,
    },
    {
      value: {
        foo: 'foo',
        bar: 'bar',
      },
      expect: ['foo', 'bar'],
      message: `Should not sort \`${field}\` field.`,
    },
  ])
}

testField('keywords', [
  {
    value: ['foo', 'foo'],
    expect: ['foo'],
    message: 'keywords should be unique.',
  },
])

testField('files', [
  {
    value: ['foo', 'foo'],
    expect: ['foo'],
    message: 'files should be unique.',
  },
])

testField('bugs', [
  {
    value: {
      email: 'npm@keithcirkel.co.uk',
      url: 'https://github.com/keithamus/sort-package-json/issues',
    },
    expect: ['url', 'email'],
  },
  {
    value: {
      [UNKNOWN]: UNKNOWN,
      email: 'npm@keithcirkel.co.uk',
      url: 'https://github.com/keithamus/sort-package-json/issues',
    },
    expect: ['url', 'email', UNKNOWN],
  },
])

testField('repository', [
  {
    value: {
      [UNKNOWN]: UNKNOWN,
      url: 'https://github.com/keithamus/sort-package-json',
      type: 'github',
    },
    expect: ['type', 'url', UNKNOWN],
  },
])

testField('funding', [
  {
    value: {
      [UNKNOWN]: UNKNOWN,
      url: 'https://github.com/keithamus/sort-package-json',
      type: 'github',
    },
    expect: ['type', 'url', UNKNOWN],
  },
])

testField('license', [
  {
    value: {
      [UNKNOWN]: UNKNOWN,
      url: 'https://example.com',
      type: 'MIT',
    },
    expect: ['type', 'url', UNKNOWN],
  },
])

testField('author', [
  {
    value: {
      [UNKNOWN]: UNKNOWN,
      url: 'http://keithcirkel.co.uk/',
      name: 'Keith Cirkel',
      email: 'npm@keithcirkel.co.uk',
    },
    expect: ['name', 'email', 'url', UNKNOWN],
  },
])

testField('directories', [
  {
    value: {
      [UNKNOWN]: UNKNOWN,
      example: 'example',
      man: 'man',
      doc: 'doc',
      bin: 'bin',
      lib: 'lib',
    },
    expect: ['lib', 'bin', 'man', 'doc', 'example', UNKNOWN],
  },
])

testField('scripts', [
  {
    value: {
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
    },
    expect: [
      'postinstall',
      'multiply',
      'pre-fetch-info',
      'prepare',
      'preprettier',
      'prettier',
      'postprettier',
      'start',
      'pretest',
      'test',
      'posttest',
      'prewatch',
      'watch',
    ],
  },
])

testField('betterScripts', [
  {
    value: {
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
    },
    expect: [
      'postinstall',
      'multiply',
      'pre-fetch-info',
      'prepare',
      'preprettier',
      'prettier',
      'postprettier',
      'start',
      'pretest',
      'test',
      'posttest',
      'prewatch',
      'watch',
    ],
  },
])

// dependencies
for (const field of [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'bundledDependencies',
  'bundleDependencies',
  'optionalDependencies',
]) {
  testField(field, [
    {
      value: {
        'sort-object-keys': '^1.1.2',
        glob: '^7.1.6',
      },
      expect: ['glob', 'sort-object-keys'],
    },
  ])
}

// CLI `--check` flag tests

// make sure `--check` not fixing file
// support `-c` as well
const orignal = fs.readFileSync('fixtures/not-sorted-1/package.json', 'utf8')
execFile(
  'node',
  ['index.js', 'fixtures/not-sorted-1/package.json', '-c'],
  (error, stdout, stderr) => {
    assert.notStrictEqual(
      orignal,
      sortPackageJson(orignal),
      'fixtures/not-sorted-1/package.json should be a unsorted file.',
    )
    assert.strictEqual(
      orignal,
      fs.readFileSync('fixtures/not-sorted-1/package.json', 'utf8'),
      'file should not fixed when --check is enabled.',
    )
    assert.strictEqual(
      error.code,
      1,
      'error.code should equals to unsorted file length',
    )
    assert.strictEqual(stderr, '')
    assert.strictEqual(
      stdout.trim(),
      'fixtures/not-sorted-1/package.json\n1 file is not sorted.',
    )
  },
)

execFile(
  'node',
  ['index.js', 'fixtures/not-sorted-*/package.json', '--check'],
  (error, stdout, stderr) => {
    assert.strictEqual(error.code, 2)
    assert.strictEqual(stderr, '')
    assert.strictEqual(
      stdout.includes('fixtures/not-sorted-1/package.json'),
      true,
    )
    assert.strictEqual(
      stdout.includes('fixtures/not-sorted-2/package.json'),
      true,
    )
    assert.strictEqual(stdout.includes('2 files are not sorted.'), true)
  },
)

execFile(
  'node',
  ['index.js', 'fixtures/sorted-1/package.json', '--check'],
  (error, stdout, stderr) => {
    assert.strictEqual(error, null)
    assert.strictEqual(stderr, '')
    assert.strictEqual(stdout.trim(), 'file is sorted.')
  },
)

execFile(
  'node',
  ['index.js', 'fixtures/sorted-*/package.json', '--check'],
  (error, stdout, stderr) => {
    assert.strictEqual(error, null)
    assert.strictEqual(stderr, '')
    assert.strictEqual(stdout.trim(), 'all files are sorted.')
  },
)

execFile(
  'node',
  ['index.js', 'fixtures/*/package.json', '--check'],
  (error, stdout, stderr) => {
    assert.strictEqual(error.code, 3)
    assert.strictEqual(stderr, '')
    assert.strictEqual(stdout.includes('fixtures/sorted-1/package.json'), false)
    assert.strictEqual(stdout.includes('fixtures/sorted-2/package.json'), false)
    assert.strictEqual(
      stdout.includes('fixtures/not-sorted-1/package.json'),
      true,
    )
    assert.strictEqual(
      stdout.includes('fixtures/not-sorted-2/package.json'),
      true,
    )
    assert.strictEqual(
      stdout.includes('fixtures/another-not-sorted/package.json'),
      true,
    )
    assert.strictEqual(stdout.includes('3 files are not sorted.'), true)
  },
)
