import test from 'ava'
import { macro } from './_helpers.js'

for (const deep of [false, true]) {
  const titleSuffix = deep ? `(deep)` : ''

  {
    const exports = {
      unknown: './unknown.unknown',
      './path-not-really-makes-no-sense': {},
      types: './types.d.ts',
      'types@<=1': './v1/types.d.ts',
    }

    test(`'types' condition should be first${titleSuffix}`, macro.sortObject, {
      path: 'exports',
      expect: 'snapshot',
      value: deep ? { './deep': exports } : exports,
    })
  }

  {
    const exports = {
      unknown: './unknown.unknown',
      './path-not-really-makes-no-sense': {},
      'types@<=1': './v1/types.d.ts',
      types: './types.d.ts',
    }

    test(
      `'types' condition should be first${titleSuffix} 2`,
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
      './path-not-really-makes-no-sense': {},
      default: './default.js',
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
