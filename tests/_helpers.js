const dotProp = require('dot-prop')
const sortPackageJson = require('..')
const path = require('path')
const { execFile } = require('child_process')
const cliScript = path.join(__dirname, '../cli.js')

// object can't compare keys order, so use string to test
const sortPackageJsonAsString = (key, value, pretty) =>
  JSON.stringify(
    sortPackageJson(dotProp.set({}, key, value)),
    null,
    pretty === false ? undefined : 2,
  )

const sortPackageJsonAsObject = (path, value) =>
  dotProp.get(sortPackageJson(dotProp.set({}, path, value)), path)

const keysToObject = keys =>
  keys.reduce((object, key) => Object.assign(object, { [key]: '' }), {})

function sortObjectAlphabetically(t, options) {
  sortObject(t, {
    ...options,
    value: keysToObject(['z', 'a']),
    expected: keysToObject(['a', 'z']),
  })
}

function sortObject(
  t,
  { path, value, expected, message = `Should sort \`${path}\` as object.` },
) {
  if (expected) {
    t.deepEqual(
      sortPackageJsonAsString(path, value),
      JSON.stringify(dotProp.set({}, path, expected), null, 2),
      message,
    )
  } else {
    t.snapshot(sortPackageJsonAsString(path, value), message)
  }
}

function asItIs(t, { path }) {
  t.is(
    sortPackageJsonAsString(path, keysToObject(['z', 'a'])),
    JSON.stringify(dotProp.set({}, path, keysToObject(['z', 'a'])), null, 2),
    `Should keep object type \`${path}\` as it is.`,
  )

  t.deepEqual(
    sortPackageJsonAsObject(path, ['z', 'a', 'a']),
    ['z', 'a', 'a'],
    `Should keep array type \`${path}\` as it is.`,
  )

  for (const value of ['string', false, 2020]) {
    t.is(
      sortPackageJsonAsObject(path, value),
      value,
      `Should keep ${typeof value} type \`${path}\` as it is.`,
    )
  }
}

async function testCLI(t, args = [], message) {
  const actual = await runCLI(args)
  t.snapshot(actual, message)
}

function runCLI(args = []) {
  return new Promise(resolve => {
    execFile('node', [cliScript, ...args], (error, stdout, stderr) => {
      resolve({ errorCode: error && error.code, stdout, stderr })
    })
  })
}

module.exports = {
  macro: {
    sortObject,
    asItIs,
    sortObjectAlphabetically,
    testCLI,
  },
  sortPackageJsonAsObject,
  sortPackageJsonAsString,
  keysToObject,
  cliScript,
  runCLI,
}
