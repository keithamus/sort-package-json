import test from 'ava'
import { macro } from './_helpers.js'

// `resolutions` and `dependencies`
for (const field of [
  'resolutions',
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
]) {
  test(field, macro.sortObjectAlphabetically, { path: field })
}

// `bundledDependencies`
for (const field of [
  'bundledDependencies',
  'bundleDependencies',
  'extensionPack',
  'extensionDependencies',
]) {
  test(field, macro.uniqueAndSort, { path: field })
}

// peerDependenciesMeta
test('peerDependenciesMeta', macro.sortObjectAlphabetically, {
  path: 'peerDependenciesMeta',
  maxDepth: 2,
  // TODO: don't use snapshot, find a esaier way for review
  expect: 'snapshot',
})

// dependenciesMeta
test('dependenciesMeta', macro.sortObjectAlphabetically, {
  path: 'dependenciesMeta',
  maxDepth: 2,
  // TODO: don't use snapshot, find a esaier way for review
  expect: 'snapshot',
})

test('dependenciesMetaRange', macro.sortObjectWithRangeAlphabetically, {
  path: 'dependenciesMeta',
  maxDepth: 2,
  // TODO: don't use snapshot, find a esaier way for review
  expect: 'snapshot',
})

test('pnpm.overrides', macro.sortObjectWithRangeAlphabetically, {
  path: 'pnpm.overrides',
  maxDepth: 2,
  // TODO: don't use snapshot, find a esaier way for review
  expect: 'snapshot',
})

test('dependencies with capital and lowercase letters', (t) => {
  const input = {
    dependencies: {
      'JSONStream': '^1.3.5',
      'axios': '^1.9.0',
      'json-schema': '^0.4.0',
    },
  }
  const expected = {
    dependencies: {
      'axios': '^1.9.0',
      'JSONStream': '^1.3.5',
      'json-schema': '^0.4.0',
    },
  }
  t.deepEqual(macro.sortObjectLikeNpm(input.dependencies), expected.dependencies)
})

test('devDependencies with capital and lowercase letters', (t) => {
  const input = {
    devDependencies: {
      'JSONStream': '^1.3.5',
      'axios': '^1.9.0',
      'json-schema': '^0.4.0',
      'webpack': '^5.36.2',
    },
  }
  const expected = {
    devDependencies: {
      'JSONStream': '^1.3.5',
      'axios': '^1.9.0',
      'json-schema': '^0.4.0',
      'webpack': '^5.36.2',
    },
  }
  t.deepEqual(macro.sortObjectLikeNpm(input.devDependencies), expected.devDependencies)
})
