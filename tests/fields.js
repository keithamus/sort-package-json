const test = require('ava')
const sortPackageJson = require('..')
const { macro, keysToObject } = require('./_helpers')
const gitHooks = require('git-hooks-list')

// fields sort keep as it is
for (const field of [
  '$schema',
  'name',
  'displayName',
  'version',
  'description',
  'sideEffects',
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
  'typesVersions',
  'typings',
  'style',
  'example',
  'examplestyle',
  'assets',
  'man',
  'workspaces',
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
  test(field, macro.asItIs, { path: field })
}

// fields sort alphabetically
for (const field of [
  'bin',
  'contributes',
  'commitlint',
  'config',
  'nodemonConfig',
  'browserify',
  'babel',
  'xo',
  'ava',
  'jest',
  'mocha',
  'nyc',
  'c8',
  'engines',
  'engineStrict',
  'preferGlobal',
  'publishConfig',
  'galleryBanner',
  'remarkConfig',
  'release',
  'npmpkgjsonlint',
  'npmPackageJsonLintConfig',
  'npmpackagejsonlint',
]) {
  test(field, macro.sortObjectAlphabetically, { path: field })
}

// should unique
for (const field of ['keywords', 'files', 'activationEvents', 'categories']) {
  test(field, macro.uniqueArray, { path: field })
}

test('husky', macro.sortObject, {
  path: 'husky.hooks',
  value: keysToObject(['z', ...gitHooks, 'a']),
  expect: keysToObject([...gitHooks, 'a', 'z']),
})

test('binary', macro.sortObject, {
  path: 'binary',
  value: {
    z: 'z',
    a: 'a',
    module_name: 'node_addon_example',
    module_path: './lib/binding/{configuration}/{node_abi}-{platform}-{arch}/',
    remote_path: './{module_name}/v{version}/{configuration}/',
    package_name:
      '{module_name}-v{version}-{node_abi}-{platform}-{arch}.tar.gz',
    host: 'https://node-pre-gyp-tests.s3-us-west-1.amazonaws.com',
  },
  expect: {
    module_name: 'node_addon_example',
    module_path: './lib/binding/{configuration}/{node_abi}-{platform}-{arch}/',
    remote_path: './{module_name}/v{version}/{configuration}/',
    package_name:
      '{module_name}-v{version}-{node_abi}-{platform}-{arch}.tar.gz',
    host: 'https://node-pre-gyp-tests.s3-us-west-1.amazonaws.com',
    a: 'a',
    z: 'z',
  },
})

test('bugs', macro.sortObject, {
  path: 'bugs',
  value: {
    z: 'z',
    a: 'a',
    email: 'npm@keithcirkel.co.uk',
    url: 'https://github.com/keithamus/sort-package-json/issues',
  },
  expect: {
    url: 'https://github.com/keithamus/sort-package-json/issues',
    email: 'npm@keithcirkel.co.uk',
    a: 'a',
    z: 'z',
  },
})

for (const field of ['repository', 'funding', 'license']) {
  test(field, macro.sortObject, {
    path: field,
    value: {
      z: 'z',
      a: 'a',
      url: 'https://github.com/keithamus/sort-package-json',
      type: 'github',
    },
    expect: {
      type: 'github',
      url: 'https://github.com/keithamus/sort-package-json',
      a: 'a',
      z: 'z',
    },
  })
}

test('author', macro.sortObject, {
  path: 'author',
  value: {
    z: 'z',
    a: 'a',
    url: 'http://keithcirkel.co.uk/',
    name: 'Keith Cirkel',
    email: 'npm@keithcirkel.co.uk',
  },
  expect: {
    name: 'Keith Cirkel',
    email: 'npm@keithcirkel.co.uk',
    url: 'http://keithcirkel.co.uk/',
    a: 'a',
    z: 'z',
  },
})

test('directories', macro.sortObject, {
  path: 'directories',
  value: {
    z: 'z',
    a: 'a',
    example: 'example',
    man: 'man',
    test: 'test',
    doc: 'doc',
    bin: 'bin',
    lib: 'lib',
  },
  expect: {
    lib: 'lib',
    bin: 'bin',
    man: 'man',
    doc: 'doc',
    example: 'example',
    test: 'test',
    a: 'a',
    z: 'z',
  },
})

test('contributors', (t) => {
  const contributors = {
    contributors: [
      {
        z: 'z',
        a: 'a',
        url: 'http://keithcirkel.co.uk/',
        name: 'Keith Cirkel',
        email: 'npm@keithcirkel.co.uk',
        _: 'this should still be the first element',
      },

      {
        z: 'z',
        a: 'a',
        url: 'http://keithcirkel.co.uk/',
        name: 'Keith Cirkel',
        email: 'npm@keithcirkel.co.uk',
        _: 'this should still be the second element',
      },
    ],
  }

  t.snapshot(
    sortPackageJson(JSON.stringify(contributors, null, 2)),
    'Should sort `contributors[]` as `PeopleField`',
  )
})

test('badges', (t) => {
  const badges = {
    badges: [
      {
        z: 'z',
        a: 'a',
        href: 'https://travis-ci.com/keithamus/sort-package-json.svg',
        url: 'https://travis-ci.com/keithamus/sort-package-json',
        description: 'sort-package-json build status',
        _: 'this should still be the first element',
      },

      {
        z: 'z',
        a: 'a',
        href: 'https://travis-ci.com/keithamus/sort-package-json.svg',
        url: 'https://travis-ci.com/keithamus/sort-package-json',
        description: 'sort-package-json build status',
        _: 'this should still be the second element',
      },
    ],
  }

  t.snapshot(
    sortPackageJson(JSON.stringify(badges, null, 2)),
    'Should sort `badges[]`',
  )
})
