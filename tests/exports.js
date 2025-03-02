import test from 'ava'
import { macro } from './_helpers.js'

for (const deep of [false, true]) {
  const titleSuffix = deep ? `(deep)` : ''

  {
    const exports = {
      unknown: './unknown.unknown',
      './path-not-really-makes-no-sense': {},
      types: './types.d.ts',
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
      default: './default.js',
    }

    test(`'default' condition should be last${titleSuffix}`, macro.sortObject, {
      path: 'exports',
      expect: 'snapshot',
      value: deep ? { './deep': exports } : exports,
    })
  }

  {
    const exports = {
      unknown: './unknown.unknown',
      require: './require.cjs',
      './path-not-really-makes-no-sense': {},
      'module-sync': './module-sync.mjs',
    }

    test(
      `'module-sync' condition should before 'require'${titleSuffix}`,
      macro.sortObject,
      {
        path: 'exports',
        expect: 'snapshot',
        value: deep ? { './deep': exports } : exports,
      },
    )
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

test(`Only 'module-sync' and 'require'`, macro.sortObject, {
  path: 'exports',
  expect: 'snapshot',
  value: {
    require: './require.cjs',
    'module-sync': './module-sync.mjs',
  },
})

test(`Well formed`, macro.sortObject, {
  path: 'exports',
  expect: 'snapshot',
  value: {
    types: './types.d.ts',
    'module-sync': './module-sync.mjs',
    require: './require.cjs',
    default: './default.js',
  },
})
