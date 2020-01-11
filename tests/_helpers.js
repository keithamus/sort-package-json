const path = require('path')
const fs = require('fs')
const dotProp = require('dot-prop')
const tempy = require('tempy')
const makeDir = require('make-dir')
const del = require('del')
const sortPackageJson = require('..')
const { execFile } = require('child_process')
const cliScript = path.join(__dirname, '../cli.js')

// object can't compare keys order, so use string to test
const sortPackageJsonAsString = ({ path, value, options }, pretty = true) => {
  const input = path ? dotProp.set({}, path, value) : value
  const output = sortPackageJson(input, options)

  return {
    options,
    pretty,
    input: JSON.stringify(input, null, pretty ? 2 : undefined),
    output: JSON.stringify(output, null, pretty ? 2 : undefined),
  }
}

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
      sortPackageJsonAsString({ path, value, options }).output,
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
      }).output,
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

  for (const value of ['string', false, 2020, undefined, null]) {
    const type = value === null ? 'null' : typeof value
    if (!excludeTypes.includes(type)) {
      t.is(
        sortPackageJsonAsObject({ path, value, options }),
        value,
        `Should keep ${type} type \`${path}\` as it is.`,
      )
    }
  }
}

async function testCLI(t, { fixtures = [], args, message }) {
  const cwd = tempy.directory()

  fixtures = fixtures.map(({ file = 'package.json', content, expect }) => {
    const absolutePath = path.join(cwd, file)
    makeDir.sync(path.dirname(absolutePath))

    const original =
      typeof content === 'string' ? content : JSON.stringify(content, null, 2)

    fs.writeFileSync(absolutePath, original)

    return {
      file,
      absolutePath,
      original,
      expect:
        typeof expect === 'string' ? expect : JSON.stringify(expect, null, 2),
    }
  })

  const result = await runCLI({
    args,
    cwd,
    message,
  })

  for (const fixture of fixtures) {
    fixture.actual = fs.readFileSync(fixture.absolutePath, 'utf8')
  }

  // clean up fixtures
  del.sync(cwd, { force: true })

  for (const { actual, expect, file } of fixtures) {
    t.is(actual, expect, `\`${file}\` content is expected.`)
  }

  t.snapshot(
    {
      fixtures: fixtures.map(({ file, original, expect }) => ({
        file,
        original,
        expect,
      })),
      args,
      result,
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
}
