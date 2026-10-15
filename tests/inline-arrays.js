import test from 'ava'
import sortPackageJson from '../index.js'

test('small arrays are contracted into a single line', (t) => {
  t.is(
    sortPackageJson('{\n  "workspaces": [\n    "./packages/*"\n  ]\n}'),
    '{\n  "workspaces": ["./packages/*"]\n}',
  )
  t.is(
    sortPackageJson('{\n  "files": [\n    "index.js",\n    "cli.js"\n  ]\n}\n'),
    '{\n  "files": ["index.js", "cli.js"]\n}\n',
  )
  t.is(
    sortPackageJson('{\n  "os": [\n    "linux",\n    "darwin"\n  ]\n}'),
    '{\n  "os": ["linux", "darwin"]\n}',
  )
})

test('arrays are contracted based on line width, not item count', (t) => {
  // `  "files": ` is 11 columns; `["..."]` wraps the item in 4 characters.
  // A 65-character item ends at exactly column 80: contracted.
  const fits = 'a'.repeat(65)
  t.is(
    sortPackageJson(`{\n  "files": [\n    "${fits}"\n  ]\n}`),
    `{\n  "files": ["${fits}"]\n}`,
  )
  // one character longer: exceeds 80 columns, stays expanded
  const tooLong = `${'a'.repeat(65)}b`
  t.is(
    sortPackageJson(`{\n  "files": [\n    "${tooLong}"\n  ]\n}`),
    `{\n  "files": [\n    "${tooLong}"\n  ]\n}`,
  )
})

test('arrays with non-primitive items are never contracted', (t) => {
  const input =
    '{\n  "badges": [\n    {\n      "a": 1\n    },\n    {\n      "b": 2\n    }\n  ]\n}'
  t.is(sortPackageJson(input), input)
})

test('nested small arrays are contracted inside expanded arrays', (t) => {
  t.is(
    sortPackageJson(
      '{\n  "x": [\n    [\n      "b",\n      "c"\n    ],\n    "a"\n  ]\n}',
    ),
    '{\n  "x": [\n    ["b", "c"],\n    "a"\n  ]\n}',
  )
})

test('empty arrays stay on one line', (t) => {
  t.is(sortPackageJson('{\n  "files": []\n}'), '{\n  "files": []\n}')
})

test('contraction respects tab indentation', (t) => {
  t.is(
    sortPackageJson('{\n\t"files": [\n\t\t"index.js"\n\t]\n}'),
    '{\n\t"files": ["index.js"]\n}',
  )
})

test('contraction preserves CRLF newlines', (t) => {
  t.is(
    sortPackageJson('{\r\n  "files": [\r\n    "a"\r\n  ]\r\n}\r\n'),
    '{\r\n  "files": ["a"]\r\n}\r\n',
  )
})

test('contraction preserves a missing trailing newline', (t) => {
  t.is(
    sortPackageJson('{\n  "files": [\n    "a"\n  ]\n}'),
    '{\n  "files": ["a"]\n}',
  )
})

test('compact input stays compact', (t) => {
  t.is(sortPackageJson('{"files":["a","b"]}'), '{"files":["a","b"]}')
})
