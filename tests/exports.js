import test from 'ava'
import { macro } from './_helpers.js'

for (const deep of [false, true]) {
  const titleSuffix = deep ? `(deep)` : ''

  {
    const exports = {
      unknown: './unknown.unknown',
      './path-not-really-makes-no-sense': {},
    }

    test(`paths (starting .) should be first${titleSuffix}`, macro.sortObject, {
      path: 'exports',
      expect: 'snapshot',
      value: deep ? { './deep': exports } : exports,
    })
  }

  {
    const exports = {
      'unknown-3': './unknown.unknown3',
      './path-not-really-makes-no-sense': {},
      'unknown-1': './unknown.unknown1',
      default: './whatever/index.js',
      types: './types.d.ts',
      'unknown-2': './unknown.unknown2',
      'types@<=1': './v1/types.d.ts',
    }

    test(
      `keys that are not paths or 'default' should retain order, including those that start 'types...' ${titleSuffix}`,
      macro.sortObject,
      {
        path: 'exports',
        expect: 'snapshot',
        value: deep ? { './deep': exports } : exports,
      },
    )
  }

  {
    const exports = {
      unknown: './unknown.unknown',
      default: './default.js',
      './path-not-really-makes-no-sense': {},
    }

    test(`'default' condition should be last${titleSuffix}`, macro.sortObject, {
      path: 'exports',
      expect: 'snapshot',
      value: deep ? { './deep': exports } : exports,
    })
  }
}

test(`Only 'types'`, macro.sortObject, {
  path: 'exports',
  expect: 'snapshot',
  value: {
    types: './types.d.ts',
  },
})

test(`Only 'default'`, macro.sortObject, {
  path: 'exports',
  expect: 'snapshot',
  value: {
    default: './default.js',
  },
})

test(`Well formed`, macro.sortObject, {
  path: 'exports',
  expect: 'snapshot',
  value: {
    types: './types.d.ts',
    default: './default.js',
  },
})
