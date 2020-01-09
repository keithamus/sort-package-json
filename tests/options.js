import test from 'ava'
import sortPackageJson from '..'
import { keysToObject, macro } from './_helpers'

test('options.sortOrder', macro.sortObject, {
  options: {
    sortOrder: ['z', 'a', 'name'],
  },
  value: keysToObject(['z', 'name', 'a']),
  expected: keysToObject(['z', 'a', 'name']),
  message: 'Should sort in order of `options.sortOrder`',
})

test('options.sortOrder prepend', macro.sortObject, {
  options: {
    sortOrder: ['z', 'private'],
  },
  value: keysToObject(['b', 'a', 'z', 'version', 'name', 'private']),
  expected: keysToObject(['z', 'private', 'name', 'version', 'a', 'b']),
  message: 'Should still sort `name` and `version`',
})

test('options.sortOrder effect', macro.sortObject, {
  options: {
    sortOrder: ['z', 'private'],
  },
  path: 'bin',
  value: keysToObject(['b', 'a', 'z', 'version', 'name', 'private']),
  expected: keysToObject(['a', 'b', 'name', 'private', 'version', 'a', 'z']),
  message: 'options.sortOrder should not effect fields ordering`',
})
