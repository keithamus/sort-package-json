import test from 'ava'
import { macro } from './_helpers.js'

for (const deep of [false, true]) {
  const titleSuffix = deep ? `(deep)` : ''

  {
    const exports = {
      unknown: './unknown.unknown',
      './path-not-really-makes-no-sense': {},
      import: './import.mjs',
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
      default: './types.d.ts',
      import: './import.mjs',
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
