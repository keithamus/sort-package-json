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
