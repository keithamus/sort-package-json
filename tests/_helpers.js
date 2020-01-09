const dotProp = require('dot-prop')
const tempy = require('tempy')
const sortPackageJson = require('..')
const path = require('path')
const fs = require('fs')
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

  asItIs(t, { path, options }, ['object'])
}

function asItIs(t, { path, options }, excludeTypes = []) {
  // Don't test string type on root, `JSON.parse` might throws
  if (!path) {
    excludeTypes.push('string')
  }

  if (!excludeTypes.includes('object')) {
    t.is(
      sortPackageJsonAsString({
        path,
        value: keysToObject(['z', 'a']),
        options,
      }),
      JSON.stringify(dotProp.set({}, path, keysToObject(['z', 'a'])), null, 2),
      `Should keep object type \`${path}\` as it is.`,
    )
  }

  if (!excludeTypes.includes('array')) {
    t.deepEqual(
      sortPackageJsonAsObject({ path, value: ['z', 'a', 'a'], options }),
      ['z', 'a', 'a'],
      `Should keep array type \`${path}\` as it is.`,
    )
  }

  for (const value of ['string', false, 2020]) {
    const type = typeof value
    if (!excludeTypes.includes(type)) {
      t.is(
        sortPackageJsonAsObject({ path, value, options }),
        value,
        `Should keep ${type} type \`${path}\` as it is.`,
      )
    }
  }
}

async function testCLI(t, { fixtures = {}, args, cwd, message }) {
  const { root } = setupFixtures(fixtures)
  const actual = await runCLI({
    args,
    cwd: cwd || root,
    message,
  })

  cleanFixtures(root)
  t.snapshot(
    {
      fixtures: Object.keys(fixtures).map(dir => `${dir}/packages.json`),
      args,
      result: actual,
    },
    message,
  )
}

function runCLI({ args = [], cwd = process.cwd() }) {
  return new Promise(resolve => {
    execFile('node', [cliScript, ...args], { cwd }, (error, stdout, stderr) => {
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
  asItIs(t, { path, options }, ['array'])
}

function uniqueAndSort(t, { path, options }) {
  t.deepEqual(
    sortPackageJsonAsObject({ path, value: ['z', 'a', 'a'], options }),
    ['a', 'z'],
    `Should unique and sorted array type \`${path}\`.`,
  )
  asItIs(t, { path, options }, ['array'])
}

function setupFixtures(fixtures) {
  const root = tempy.directory()
  const result = {
    root,
  }
  for (const [dir, packageJson] of Object.entries(fixtures)) {
    const content =
      typeof packageJson === 'string'
        ? packageJson
        : JSON.stringify(packageJson, null, 2)
    const file = path.join(root, dir, 'package.json')
    fs.mkdirSync(path.join(root, dir), { recursive: true })
    fs.writeFileSync(file, content)
    result[dir] = file
  }

  return result
}

function cleanFixtures(root) {
  fs.rmdirSync(root, { recursive: true })
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
  setupFixtures,
  cleanFixtures,
}
