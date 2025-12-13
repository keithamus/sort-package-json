import test from 'ava'
import fs from 'node:fs'
import sortPackageJson from '../index.js'

// Test case from the original issue: https://github.com/keithamus/sort-package-json/issues/363
// @types/babel-plugin-tester vs @types/babel__core vs @types/babel__register

test('npm: sorts dependencies using localeCompare with engines.npm', (t) => {
  const originalExistsSync = fs.existsSync

  // Mock fs.existsSync to simulate pnpm-lock.yaml exists
  // engines.npm should take precedence over this lockfile
  fs.existsSync = (path) => path.endsWith('pnpm-lock.yaml')

  try {
    const input = {
      name: 'test-package',
      engines: {
        npm: '>=10.0.0',
      },
      devDependencies: {
        '@types/babel__register': '7.17.3',
        '@types/babel-plugin-tester': '9.0.10',
        '@types/babel__core': '7.20.5',
      },
    }

    const result = sortPackageJson(input)

    // npm uses localeCompare which sorts underscore before hyphen
    t.deepEqual(Object.keys(result.devDependencies), [
      '@types/babel__core',
      '@types/babel__register',
      '@types/babel-plugin-tester',
    ])
  } finally {
    // Restore original function
    fs.existsSync = originalExistsSync
  }
})

test('pnpm: detects pnpm usage by root `pnpm` package.json field', (t) => {
  const originalExistsSync = fs.existsSync

  // Mock fs.existsSync to simulate yarn.lock exists
  // pnpm field should take precedence over yarn.lock
  fs.existsSync = (path) => path.endsWith('yarn.lock')

  try {
    const input = {
      name: 'test-package',
      pnpm: {
        overrides: {
          'some-package': '1.0.0',
        },
      },
      devDependencies: {
        '@types/babel__register': '7.17.3',
        '@types/babel-plugin-tester': '9.0.10',
        '@types/babel__core': '7.20.5',
      },
    }

    const result = sortPackageJson(input)

    // pnpm uses string comparison which sorts hyphen before underscore
    t.deepEqual(Object.keys(result.devDependencies), [
      '@types/babel-plugin-tester',
      '@types/babel__core',
      '@types/babel__register',
    ])
  } finally {
    // Restore original function
    fs.existsSync = originalExistsSync
  }
})

test('yarn: sorts dependencies using string comparison', (t) => {
  const input = {
    name: 'test-package',
    packageManager: 'yarn@4.6.0',
    devDependencies: {
      '@types/babel__register': '7.17.3',
      '@types/babel-plugin-tester': '9.0.10',
      '@types/babel__core': '7.20.5',
    },
  }

  const result = sortPackageJson(input)

  // yarn uses string comparison which sorts hyphen before underscore
  t.deepEqual(Object.keys(result.devDependencies), [
    '@types/babel-plugin-tester',
    '@types/babel__core',
    '@types/babel__register',
  ])
})

test('pnpm: sorts dependencies using string comparison', (t) => {
  const input = {
    name: 'test-package',
    packageManager: 'pnpm@9.0.0',
    devDependencies: {
      '@types/babel__register': '7.17.3',
      '@types/babel-plugin-tester': '9.0.10',
      '@types/babel__core': '7.20.5',
    },
  }

  const result = sortPackageJson(input)

  // pnpm uses string comparison which sorts hyphen before underscore
  t.deepEqual(Object.keys(result.devDependencies), [
    '@types/babel-plugin-tester',
    '@types/babel__core',
    '@types/babel__register',
  ])
})

test('npm: defaults to npm sorting when no packageManager field, nor any other signals for what package manager is used, can be found', (t) => {
  const input = {
    name: 'test-package',
    devDependencies: {
      '@types/babel__register': '7.17.3',
      '@types/babel-plugin-tester': '9.0.10',
      '@types/babel__core': '7.20.5',
    },
  }

  const result = sortPackageJson(input)

  // Should default to npm behavior
  t.deepEqual(Object.keys(result.devDependencies), [
    '@types/babel__core',
    '@types/babel__register',
    '@types/babel-plugin-tester',
  ])
})

test('lock file detection: yarn.lock', (t) => {
  const originalExistsSync = fs.existsSync

  // Mock fs.existsSync to simulate yarn.lock exists
  fs.existsSync = (path) => path.endsWith('yarn.lock')

  try {
    const input = {
      name: 'test-package',
      devDependencies: {
        '@types/babel__register': '7.17.3',
        '@types/babel-plugin-tester': '9.0.10',
        '@types/babel__core': '7.20.5',
      },
    }

    const result = sortPackageJson(input)

    // Should use yarn sorting (string comparison)
    t.deepEqual(Object.keys(result.devDependencies), [
      '@types/babel-plugin-tester',
      '@types/babel__core',
      '@types/babel__register',
    ])
  } finally {
    // Restore original function
    fs.existsSync = originalExistsSync
  }
})

test('packageManager field takes precedence over lock files', (t) => {
  const originalExistsSync = fs.existsSync

  // Mock fs.existsSync to simulate package-lock.json exists
  fs.existsSync = (path) => path.endsWith('package-lock.json')

  try {
    const input = {
      name: 'test-package',
      packageManager: 'yarn@4.6.0',
      devDependencies: {
        '@types/babel__register': '7.17.3',
        '@types/babel-plugin-tester': '9.0.10',
        '@types/babel__core': '7.20.5',
      },
    }

    const result = sortPackageJson(input)

    // Should use yarn sorting (from packageManager field) not npm (from lock file)
    t.deepEqual(Object.keys(result.devDependencies), [
      '@types/babel-plugin-tester',
      '@types/babel__core',
      '@types/babel__register',
    ])
  } finally {
    // Restore original function
    fs.existsSync = originalExistsSync
  }
})
