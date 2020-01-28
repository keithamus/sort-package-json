const test = require('ava')
const sortPackageJson = require('..')
const { keysToObject, macro } = require('./_helpers')

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

for (const key of ['env', 'globals', 'parserOptions', 'rules', 'settings']) {
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

test('eslintConfig.override[]', t => {
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
