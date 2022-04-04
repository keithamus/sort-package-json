import test from 'ava'
import sortPackageJson from '../index.js'
import { keysToObject, macro } from './_helpers.js'

test('eslintIgnore', macro.asItIs, { path: 'eslintIgnore' })

const baseEslintConfigKeys = [
  'env',
  'parser',
  'parserOptions',
  'settings',
  'plugins',
  'extends',
  'rules',
  'overrides',
  'globals',
  'processor',
  'noInlineConfig',
  'reportUnusedDisableDirectives',
]

test('eslintConfig', macro.sortObject, {
  path: 'eslintConfig',
  expect: 'snapshot',
  value: keysToObject(['z', ...baseEslintConfigKeys, 'a']),
})

test('eslintConfig.rules', macro.sortObject, {
  path: 'eslintConfig.rules',
  expect: 'snapshot',
  value: keysToObject([
    'z',
    'unknown-plugin/depth-1/depth-2',
    'unicorn/new-for-builtins',
    'unicorn/prefer-includes',
    'for-direction',
    'array-callback-return',
    'yoda',
    'prettier/prettier',
    'react/display-name',
    'react/jsx-key',
    'a',
  ]),
})

for (const key of ['env', 'globals', 'parserOptions', 'settings']) {
  const path = ['eslintConfig', key].join('.')
  test(path, macro.sortObjectAlphabetically, { path })
}

for (const key of [
  'parser',
  'plugins',
  'extends',
  'processor',
  'noInlineConfig',
  'reportUnusedDisableDirectives',
]) {
  const path = ['eslintConfig', key].join('.')
  test(path, macro.asItIs, { path })
}

test('eslintConfig.override[]', (t) => {
  const eslintConfigWithOverrides = {
    eslintConfig: {
      overrides: [
        {
          ...keysToObject(baseEslintConfigKeys),
          files: '*.js',
          excludedFiles: '*.exclude.js',
          _: 'this should still be the first element',
        },
        {
          files: '*.js',
          excludedFiles: '*.exclude.js',
          ...keysToObject(baseEslintConfigKeys),
          _: 'this should still be the second element',
        },
      ],
    },
  }

  t.snapshot(
    sortPackageJson(JSON.stringify(eslintConfigWithOverrides, null, 2)),
    'Should sort `eslintConfig.override[]` same as `eslintConfig`',
  )
})
