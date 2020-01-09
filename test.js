const assert = require('assert')
const fs = require('fs')
const newline = require('newline')
const sortPackageJson = require('./')

const UNKNOWN = 'UNKNOWN_KEY_OR_VALUE'
function testField(name, tests, options) {
  for (const { value, expect, message, property } of tests) {
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
    const object = property ? sorted[name][property] : sorted[name]
    const actual = Array.isArray(value) ? object : Object.keys(object)

    assert.deepStrictEqual(actual, expect, detail)
  }
}

let contents = fs.readFileSync('./package.json', 'utf8')

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

// defaultSortOrder still applied, when using custom sortOrder
assert.deepStrictEqual(
  Object.keys(
    sortPackageJson(
      {
        b: 'b',
        a: 'a',
        z: 'z',
        version: '1.0.0',
        name: 'foo',
        private: true,
      },
      {
        sortOrder: ['z', 'private'],
      },
    ),
  ),
  ['z', 'private', 'name', 'version', 'a', 'b'],
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

const array = ['foo', 'bar']
const string = JSON.stringify(array)
assert.strictEqual(
  sortPackageJson(array),
  array,
  'should not sort object that is not plain object',
)
assert.strictEqual(
  sortPackageJson(string),
  string,
  'should not sort object that is not plain object',
)

// fields with '_' prefix should alway at bottom
assert.deepStrictEqual(
  Object.keys(
    sortPackageJson({
      _foo: '_foo',
      foo: 'foo',
      version: '1.0.0',
      name: 'sort-package-json',
      bar: 'bar',
      _id: 'sort-package-json@1.0.0',
      _bar: '_bar',
    }),
  ),
  ['name', 'version', 'bar', 'foo', '_bar', '_foo', '_id'],
)

// fields tests

// fields sort as object
for (const field of [
  'exports',
  'bin',
  'contributes',
  'commitlint',
  'lint-staged',
  'config',
  'nodemonConfig',
  'browserify',
  'babel',
  'xo',
  'ava',
  'jest',
  'mocha',
  'nyc',
  'engines',
  'engineStrict',
  'preferGlobal',
  'publishConfig',
  'galleryBanner',
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
  'displayName',
  'version',
  'description',
  'sideEffects',
  'files',
  'categories',
  'keywords',
  'qna',
  'publisher',
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
  'man',
  'workspaces',
  'activationEvents',
  'pre-commit',
  'browserslist',
  'stylelint',
  'flat',
  'os',
  'cpu',
  'icon',
  'preview',
  'markdown',
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

testField('husky', [
  {
    property: 'hooks',
    value: {
      hooks: {
        'commit-msg': '',
        [UNKNOWN]: UNKNOWN,
        'pre-commit': '',
      },
    },
    expect: ['pre-commit', 'commit-msg', UNKNOWN],
  },
])

testField('binary', [
  {
    value: {
      [UNKNOWN]: UNKNOWN,
      module_name: 'node_addon_example',
      module_path:
        './lib/binding/{configuration}/{node_abi}-{platform}-{arch}/',
      remote_path: './{module_name}/v{version}/{configuration}/',
      package_name:
        '{module_name}-v{version}-{node_abi}-{platform}-{arch}.tar.gz',
      host: 'https://node-pre-gyp-tests.s3-us-west-1.amazonaws.com',
    },
    expect: [
      'module_name',
      'module_path',
      'remote_path',
      'package_name',
      'host',
      UNKNOWN,
    ],
  },
])

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

// contributors
assert.deepStrictEqual(
  Object.keys(
    sortPackageJson({
      contributors: [
        {
          [UNKNOWN]: UNKNOWN,
          url: 'http://keithcirkel.co.uk/',
          name: 'Keith Cirkel',
          email: 'npm@keithcirkel.co.uk',
        },
      ],
    }).contributors[0],
  ),
  ['name', 'email', 'url', UNKNOWN],
)
assert.deepStrictEqual(
  sortPackageJson({
    contributors: ['foo', 'bar', ['foo', 'bar']],
  }).contributors,
  ['foo', 'bar', ['foo', 'bar']],
)

// badges
assert.deepStrictEqual(
  Object.keys(
    sortPackageJson({
      badges: [
        {
          [UNKNOWN]: UNKNOWN,
          href: 'https://travis-ci.com/keithamus/sort-package-json.svg',
          url: 'https://travis-ci.com/keithamus/sort-package-json',
          description: 'sort-package-json build status',
        },
      ],
    }).badges[0],
  ),
  ['description', 'url', 'href', UNKNOWN],
)
assert.deepStrictEqual(
  sortPackageJson({
    badges: ['foo', 'bar', ['foo', 'bar']],
  }).badges,
  ['foo', 'bar', ['foo', 'bar']],
)

testField('directories', [
  {
    value: {
      [UNKNOWN]: UNKNOWN,
      example: 'example',
      man: 'man',
      test: 'test',
      doc: 'doc',
      bin: 'bin',
      lib: 'lib',
    },
    expect: ['lib', 'bin', 'man', 'doc', 'example', 'test', UNKNOWN],
  },
])

// `resolutions` and `dependencies`
for (const field of [
  'resolutions',
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
]) {
  testField(field, [
    {
      value: {
        z: '2.0.0',
        a: '1.0.0',
      },
      expect: ['a', 'z'],
    },
    {
      value: ['z', 'a'],
      expect: ['z', 'a'],
      message: `Should not sort array type of ${field} field.`,
    },
  ])
}

// bundledDependencies
for (const field of [
  'bundledDependencies',
  'bundleDependencies',
  'extensionPack',
  'extensionDependencies',
]) {
  testField(field, [
    {
      value: ['z', 'a', 'a'],
      expect: ['a', 'z'],
      message: `Should sort and unique array type of ${field} field.`,
    },
    // should ignore object
    {
      value: {
        z: '2.0.0',
        a: '1.0.0',
      },
      expect: ['z', 'a'],
      message: `Should not sort object type of ${field} field.`,
    },
  ])
}
