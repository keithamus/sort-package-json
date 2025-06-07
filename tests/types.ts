import { expect, test } from 'tstyche'
import sortPackageJson, {
  sortPackageJson as nestedSorter,
} from 'sort-package-json'

test('sortPackageJson', () => {
  expect(nestedSorter({ a: '' })).type.toBe<{ a: string }>()

  expect(sortPackageJson({ a: '' })).type.toBe<{ a: string }>()

  expect(sortPackageJson('{}')).type.toBe<string>()

  expect(sortPackageJson).type.not.toBeCallableWith(1)

  expect(
    sortPackageJson('{}', {
      sortOrder: ['a', 'b'],
    }),
  ).type.toBe<string>()

  expect(
    sortPackageJson('{}', {
      sortOrder: (_a, _b) => 2,
    }),
  ).type.toBe<string>()

  expect(sortPackageJson).type.not.toBeCallableWith('{}', {
    sortOrder: (_a: string, _b: string) => 'not a number',
  })
})
