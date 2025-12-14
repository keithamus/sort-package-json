import test from 'ava'
import fs from 'node:fs'
import sortPackageJson from '../index.js'

const originalProcessCwd = process.cwd
const originalFsExistsSync = fs.existsSync

// Test case from the original issue: https://github.com/keithamus/sort-package-json/issues/363
// @types/babel-plugin-tester vs @types/babel__core vs @types/babel__register

const dependencies = {
  '@types/babel__register': '7.17.3',
  '@types/babel-plugin-tester': '9.0.10',
  '@types/babel__core': '7.20.5',
}

const npmSortedResult = [
  '@types/babel__core',
  '@types/babel__register',
  '@types/babel-plugin-tester',
]

const nonNpmSortedResult = [
  '@types/babel-plugin-tester',
  '@types/babel__core',
  '@types/babel__register',
]

const getDependencyOrders = (packageJson, mockFileExistence) => {
  // Invalid cache
  process.cwd = () => Symbol()
  if (mockFileExistence) {
    fs.existsSync = mockFileExistence
  }

  try {
    return Object.keys(
      sortPackageJson({ dependencies, ...packageJson }).dependencies,
    )
  } finally {
    process.cwd = originalProcessCwd
    fs.existsSync = originalFsExistsSync
  }
}

test('npm', (t) => {
  t.deepEqual(
    getDependencyOrders({}, () => false),
    npmSortedResult,
  )

  t.deepEqual(
    getDependencyOrders({ engine: { npm: '>1.0.0' } }, () => false),
    npmSortedResult,
  )

  // packageManager
  t.deepEqual(
    getDependencyOrders({ packageManager: 'npm@1.0.0' }, () => {
      t.fail()
    }),
    npmSortedResult,
  )
  t.deepEqual(
    getDependencyOrders(
      { devEngines: { packageManager: { name: 'npm' } } },
      () => {
        t.fail()
      },
    ),
    npmSortedResult,
  )

  // Should not call `fs.existsSync()`
  getDependencyOrders({ dependencies: { 'one-dependency': '1.0.0' } }, () => {
    t.fail()
  })
})

test('pnpm', (t) => {
  // pnpm field should take precedence over yarn.lock
  t.deepEqual(
    getDependencyOrders(
      {
        pnpm: {
          overrides: {
            'some-package': '1.0.0',
          },
        },
      },
      () => {
        t.fail()
      },
    ),
    nonNpmSortedResult,
  )

  // packageManager
  t.deepEqual(
    getDependencyOrders({ packageManager: 'pnpm@1.0.0' }, () => {
      t.fail()
    }),
    nonNpmSortedResult,
  )
  t.deepEqual(
    getDependencyOrders(
      { devEngines: { packageManager: { name: 'pnpm' } } },
      () => {
        t.fail()
      },
    ),
    nonNpmSortedResult,
  )

  // pnpm file exists
  let fsExistsSyncCalled
  t.deepEqual(
    getDependencyOrders({}, () => {
      fsExistsSyncCalled = true
      return true
    }),
    nonNpmSortedResult,
  )
  t.is(fsExistsSyncCalled, true)
})

test('yarn', (t) => {
  // packageManager
  t.deepEqual(
    getDependencyOrders({ packageManager: 'yarn@1.0.0' }, () => {
      t.fail()
    }),
    nonNpmSortedResult,
  )
  t.deepEqual(
    getDependencyOrders(
      { devEngines: { packageManager: { name: 'yarn' } } },
      () => {
        t.fail()
      },
    ),
    nonNpmSortedResult,
  )

  // yarn file exists
  let fsExistsSyncCalled
  t.deepEqual(
    getDependencyOrders({}, () => {
      fsExistsSyncCalled = true
      return true
    }),
    nonNpmSortedResult,
  )
  t.is(fsExistsSyncCalled, true)
})
