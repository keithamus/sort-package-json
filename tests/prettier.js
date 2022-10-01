import test from 'ava'
import sortPackageJson from '../index.js'
import { keysToObject, macro } from './_helpers.js'

const prettierConfig = {
  trailingComma: 'none',
  semi: false,
  ...keysToObject(['z', 'a']),
}

test('prettier', macro.sortObject, {
  path: 'prettier',
  expect: 'snapshot',
  value: {
    overrides: [],
    ...prettierConfig,
  },
})

test('prettier.overrides[]', (t) => {
  const prettierConfig = {
    prettier: {
      overrides: [
        {
          ...keysToObject(['z', 'a']),
          files: '',
          options: {},
          _: 'this should still the first element',
        },
        {
          files: '',
          ...keysToObject(['z', 'a']),
          options: {},
          _: 'this should still the seconde element',
        },
      ],
    },
  }

  t.snapshot(
    sortPackageJson(JSON.stringify(prettierConfig, null, 2)),
    'Should sort `prettier.override[]`',
  )
})

test('prettier.overrides[].options', (t) => {
  const config = {
    prettier: {
      overrides: [
        {
          options: prettierConfig,
        },
      ],
    },
  }

  t.snapshot(
    sortPackageJson(JSON.stringify(config, null, 2)),
    'Should sort `prettier.overrides[].options`',
  )
})

test('prettierIgnore', macro.asItIs, { path: 'prettierIgnore' })
