const test = require('ava')
const { keysToObject, macro } = require('./_helpers')
const sortPackageJson = require('..')

test('options.sortOrder', macro.sortObject, {
  options: {
    sortOrder: ['z', 'a', 'name'],
  },
  value: keysToObject(['z', 'name', 'a']),
  expect: keysToObject(['z', 'a', 'name']),
  message: 'Should sort in order of `options.sortOrder`',
})

test('options.sortOrder prepend', macro.sortObject, {
  options: {
    sortOrder: ['z', 'private'],
  },
  value: keysToObject(['b', 'a', 'z', 'version', 'name', 'private']),
  expect: keysToObject(['z', 'private', 'name', 'version', 'a', 'b']),
  message: 'Should still sort `name` and `version`',
})

test('options.sortOrder effect', macro.sortObject, {
  options: {
    sortOrder: ['z', 'private'],
  },
  path: 'bin',
  value: keysToObject(['b', 'a', 'z', 'version', 'name', 'private']),
  expect: keysToObject(['a', 'b', 'name', 'private', 'version', 'z']),
  message: 'options.sortOrder should not effect fields ordering`',
})

test('options.sortOrder function', macro.sortObject, {
  options: {
    sortOrder(left, right) {
      return right.localeCompare(left)
    },
  },
  value: keysToObject(['version', 'name', 'a', 'z']),
  expect: keysToObject(['z', 'version', 'name', 'a']),
  message: 'options.sortOrder should accept function`',
})

test('options.sortOrder with private key', macro.sortObject, {
  options: {
    sortOrder: ['_z'],
  },
  value: keysToObject(['z', '_a', 'name', '_z', 'a']),
  expect: keysToObject(['_z', 'name', 'a', 'z', '_a']),
  message: 'options.sortOrder should work with private keys`',
})

test('options.fields with existing key', macro.sortObject, {
  options: {
    fields: [{ key: 'scripts' }],
  },
  value: `{"scripts":{"z":"","a":""}}`,
  expect: `{"scripts":{"z":"","a":""}}`,
  message:
    'options.fields should work with keys that are already present in the fields list`',
})

test('options.fields with new key', macro.sortObject, {
  options: {
    fields: [{ key: 'new-key', over: sortPackageJson.sortObjectBy() }],
  },
  value: `{"new-key":{"z":"","a":""}}`,
  expect: `{"new-key":{"a":"","z":""}}`,
  message:
    'options.fields should work with keys that are not already present in the fields list`',
})
