import sortPackageJson, {
  sortPackageJson as nestedSorter,
  sortObjectBy,
} from 'sort-package-json'

// $ExpectType { a: string; }
nestedSorter({ a: '' })

// $ExpectType { a: string; }
sortPackageJson({ a: '' })

// $ExpectType string
sortPackageJson('{}')

// $ExpectError
sortPackageJson(1)

// $ExpectType string
sortPackageJson('{}', {
  sortOrder: ['a', 'b'],
})

// $ExpectType string
sortPackageJson('{}', {
  sortOrder: (a, b) => 2,
})

// $ExpectError
sortPackageJson('{}', {
  sortOrder: (a, b) => 'not a number',
})

// $ExpectType string
sortPackageJson('{}', {
  fields: [{ key: 'a' }],
})

// $ExpectType string
sortPackageJson('{}', {
  fields: [{ key: 'a', over: sortObjectBy() }],
})

// $ExpectType string
sortPackageJson('{}', {
  fields: [{ key: 'a', over: sortObjectBy(['a']) }],
})

// $ExpectType string
sortPackageJson('{}', {
  fields: [{ key: 'a', over: (x) => x }],
})

// $ExpectError
sortPackageJson('{}', {
  fields: [{ key: 'a', over: '' }],
})

// $ExpectError
sortPackageJson('{}', {
  fields: [{ over: (x) => x }],
})
