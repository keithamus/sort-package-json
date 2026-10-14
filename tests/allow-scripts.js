import test from 'ava'
import sortPackageJson from '../index.js'

const allowScripts = Object.freeze({
  'z-package': true,
  'pkg@2 || 3': false,
  'pkg@1 || 2': true,
  pkg: true,
  'file:./vendor/package': false,
  '@sencha/ext': false,
  '@corejslib/core': true,
  'a-package': '1.x.x',
})
const sortedKeys = [
  '@corejslib/core',
  '@sencha/ext',
  'a-package',
  'file:./vendor/package',
  'pkg',
  'pkg@1 || 2',
  'pkg@2 || 3',
  'z-package',
]

for (const inputType of ['object', 'string']) {
  test(`allowScripts sorts package keys and preserves values (${inputType})`, (t) => {
    const input = Object.freeze({ name: 'test-package', allowScripts })
    const json = JSON.stringify(input, null, 2) + '\n'
    const output = sortPackageJson(inputType === 'string' ? json : input)
    const result = inputType === 'string' ? JSON.parse(output) : output

    t.deepEqual(Object.keys(result.allowScripts), sortedKeys)
    t.deepEqual(result.allowScripts, allowScripts)
    t.is(JSON.stringify(input, null, 2) + '\n', json)
    t.is(JSON.stringify(sortPackageJson(result)), JSON.stringify(result))
    if (inputType === 'string') {
      t.true(output.endsWith('\n'))
      t.is(sortPackageJson(output), output)
    }
  })
}

test('allowScripts follows scripts in the default field order', (t) => {
  const result = sortPackageJson({
    dependencies: {},
    allowScripts,
    scripts: {},
    name: 'test-package',
  })
  t.deepEqual(Object.keys(result), [
    'name',
    'scripts',
    'allowScripts',
    'dependencies',
  ])
})

for (const sortOrder of [
  ['allowScripts', 'name'],
  (left, right) => left.localeCompare(right),
]) {
  test(`allowScripts sorts subkeys with a custom ${typeof sortOrder} sortOrder`, (t) => {
    const result = sortPackageJson(
      { name: 'test-package', allowScripts },
      { sortOrder },
    )
    t.deepEqual(Object.keys(result), ['allowScripts', 'name'])
    t.deepEqual(Object.keys(result.allowScripts), sortedKeys)
    t.deepEqual(result.allowScripts, allowScripts)
  })
}

test('allowScripts is optional and can be empty', (t) => {
  t.deepEqual(sortPackageJson({ name: 'test-package' }), {
    name: 'test-package',
  })
  t.deepEqual(sortPackageJson({ allowScripts: {} }), { allowScripts: {} })
})
