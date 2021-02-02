const test = require('ava')
const sortPackageJson = require('..')
const { macro, keysToObject } = require('./_helpers')

const fields = [...sortPackageJson.sortOrder].sort()

test('main', (t) => {
  const packageJson = { version: '1.0.0', name: 'sort-package-json' }

  t.is(
    typeof sortPackageJson(packageJson),
    'object',
    'Accepts object, returns object',
  )
  t.is(
    sortPackageJson(JSON.stringify(packageJson)),
    '{"name":"sort-package-json","version":"1.0.0"}',
    'Accepts string, returns sorted string',
  )

  const array = ['foo', 'bar']
  const string = JSON.stringify(array)
  t.is(sortPackageJson(array), array, 'should not sort object that is an array')
  t.is(
    sortPackageJson(string),
    string,
    'should not sort string that is JSON string of array',
  )
})

test('default sortOrder', macro.sortObject, {
  value: keysToObject(fields),
  expect: 'snapshot',
  message: 'Should sort fields',
})

test('private keys', macro.sortObject, {
  value: keysToObject(['z', '_a', 'name', '_z', 'a']),
  expect: keysToObject(['name', 'a', 'z', '_a', '_z']),
  message: 'Should put private keys at bottom',
})

test('comment keys', macro.sortObject, {
  value: keysToObject(['//z', '//x', 'z', ' //name', 'name', 'a', '// end']),
  expect: keysToObject([' //name', 'name', 'a', '//z', '//x', 'z', '// end']),
  message: 'Should keep comment keys above preceding key',
})
