const assert = require('assert')
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
