const dotProp = require('dot-prop')
const sortPackageJson = require('..')
const path = require('path')
const { execFile } = require('child_process')
const cliScript = path.join(__dirname, '../cli.js')

// object can't compare keys order, so use string to test
const sortPackageJsonAsString = ({ path, value, options }, pretty) =>
  JSON.stringify(
    sortPackageJson(path ? dotProp.set({}, path, value) : value, options),
    null,
    pretty === false ? undefined : 2,
  )
const sortPackageJsonAsObject = ({ path, value, options }) =>
  dotProp.get(
    sortPackageJson(path ? dotProp.set({}, path, value) : value, options),
    path,
  )

const keysToObject = keys => {
  if (keys.some((value, index) => keys.indexOf(value) !== index)) {
    throw new Error(`${keys} should be unique.`)
  }
  return keys.reduce((object, key) => Object.assign(object, { [key]: key }), {})
}

function sortObjectAlphabetically(t, options) {
  sortObject(t, {
    ...options,
    value: keysToObject(['z', 'a']),
    expect: keysToObject(['a', 'z']),
  })
}

function sortObject(
  t,
  {
    options,
    path,
    value,
    expect,
    message = `Should sort \`${path}\` as object.`,
  },
) {
  if (expect === 'snapshot') {
    t.snapshot(sortPackageJsonAsString({ path, value, options }), message)
  } else {
    t.deepEqual(
      sortPackageJsonAsString({ path, value, options }),
      JSON.stringify(path ? dotProp.set({}, path, expect) : expect, null, 2),
      message,
    )
  }
}

function asItIs(t, { path, options }) {
  t.is(
    sortPackageJsonAsString({ path, value: keysToObject(['z', 'a']), options }),
    JSON.stringify(dotProp.set({}, path, keysToObject(['z', 'a'])), null, 2),
    `Should keep object type \`${path}\` as it is.`,
  )

  t.deepEqual(
    sortPackageJsonAsObject({ path, value: ['z', 'a', 'a'], options }),
    ['z', 'a', 'a'],
    `Should keep array type \`${path}\` as it is.`,
  )

  for (const value of ['string', false, 2020]) {
    t.is(
      sortPackageJsonAsObject({ path, value, options }),
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

function uniqueArray(t, { path, options }) {
  t.deepEqual(
    sortPackageJsonAsObject({ path, value: ['z', 'a', 'a'], options }),
    ['z', 'a'],
    `Should unique array type \`${path}\`.`,
  )
}

function uniqueAndSort(t, { path, options }) {
  t.deepEqual(
    sortPackageJsonAsObject({ path, value: ['z', 'a', 'a'], options }),
    ['a', 'z'],
    `Should unique and sorted array type \`${path}\`.`,
  )
}

module.exports = {
  macro: {
    sortObject,
    asItIs,
    sortObjectAlphabetically,
    testCLI,
    uniqueArray,
    uniqueAndSort,
  },
  sortPackageJsonAsObject,
  sortPackageJsonAsString,
  keysToObject,
  cliScript,
  runCLI,
}
