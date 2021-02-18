import sortPackageJson, {
  sortPackageJson as nestedSorter,
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
