import path from 'node:path'
import fs from 'node:fs'
import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { getProperty, setProperty } from 'dot-prop'
import { temporaryDirectory } from 'tempy'
import makeDir from 'make-dir'
import { deleteSync } from 'del'
import sortPackageJson from '../index.js'

const cliScript = fileURLToPath(new URL('../cli.js', import.meta.url))

// object can't compare keys order, so use string to test
const sortPackageJsonAsString = ({ path, value, options }, pretty = true) => {
  const input = path ? setProperty({}, path, value) : value
  const output = sortPackageJson(input, options)

  return {
    options,
    pretty,
    input: JSON.stringify(input, null, pretty ? 2 : undefined),
    output: JSON.stringify(output, null, pretty ? 2 : undefined),
  }
}

const sortPackageJsonAsObject = ({ path, value, options }) =>
  getProperty(
    sortPackageJson(path ? setProperty({}, path, value) : value, options),
    path,
  )

const keysToObject = (keys, depth = 1) => {
  if (keys.some((value, index) => keys.indexOf(value) !== index)) {
    throw new Error(`${keys} should be unique.`)
  }

  if (depth < 1) {
    throw new Error(`depth should be a positive integer, got ${depth}.`)
  }

  return keys.reduce(
    (object, key) =>
      Object.assign(object, {
        [key]: depth > 1 ? keysToObject(keys, depth - 1) : key,
      }),
    {},
  )
}

function sortObjectAlphabetically(t, options = {}) {
  const { maxDepth = 1, expect } = options

  for (let depth = 1; depth < maxDepth + 1; depth++) {
    sortObject(t, {
      ...options,
      value: keysToObject(['z', 'a'], depth),
      expect: expect || keysToObject(['a', 'z'], depth),
    })
  }
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
      JSON.stringify(path ? setProperty({}, path, expect) : expect, null, 2),
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
      JSON.stringify(setProperty({}, path, keysToObject(['z', 'a'])), null, 2),
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
  const cwd = temporaryDirectory()

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
  deleteSync(cwd, { force: true })

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
  return new Promise((resolve) => {
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

export const macro = {
  sortObject,
  asItIs,
  sortObjectAlphabetically,
  testCLI,
  uniqueArray,
  uniqueAndSort,
}

export {
  sortPackageJsonAsObject,
  sortPackageJsonAsString,
  keysToObject,
  cliScript,
}
