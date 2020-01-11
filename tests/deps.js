import test from 'ava'
import { macro } from './_helpers'

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
