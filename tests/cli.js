import test from 'ava'
import { cliScript, macro } from './_helpers'
import fs from 'fs'

const badJson = {
  version: '1.0.0',
  name: 'sort-package-json',
}
const goodJson = {
  name: 'sort-package-json',
  version: '1.0.0',
}

test('cli', t => {
  t.notThrows(
    () => fs.accessSync(cliScript, fs.constants.X_OK),
    'CLI should be executable.',
  )
})

test('run `cli` with no patterns', macro.testCLI, {
  fixtures: [
    {
      file: 'package.json',
      content: badJson,
      expect: goodJson,
    },
  ],
  args: [],
  message: 'Should format package.json.',
})

test('run `cli --check` with no patterns', macro.testCLI, {
  fixtures: [
    {
      file: 'package.json',
      content: badJson,
      expect: badJson,
    },
  ],
  args: ['--check'],
  message: 'Should package.json is not sorted',
})

test('run `cli -c` with no patterns', macro.testCLI, {
  fixtures: [
    {
      file: 'package.json',
      content: badJson,
      expect: badJson,
    },
  ],
  args: ['-c'],
  message: 'Should support `-c` alias',
})

test('run `cli` on 1 bad file', macro.testCLI, {
  fixtures: [
    {
      file: 'bad/package.json',
      content: badJson,
      expect: goodJson,
    },
  ],
  args: ['*/package.json'],
  message: 'Should format 1 file.',
})

test('run `cli --check` on 1 bad file', macro.testCLI, {
  fixtures: [
    {
      file: 'bad/package.json',
      content: badJson,
      expect: badJson,
    },
  ],
  args: ['*/package.json', '--check'],
  message: 'Should report 1 file.',
})

test('run `cli` on 2 bad files', macro.testCLI, {
  fixtures: Array.from({ length: 2 }, (_, index) => ({
    file: `bad-${index + 1}/package.json`,
    content: badJson,
    expect: goodJson,
  })),
  args: ['*/package.json'],
  message: 'Should format 2 files.',
})

test('run `cli --check` on 2 bad files', macro.testCLI, {
  fixtures: Array.from({ length: 2 }, (_, index) => ({
    file: `bad-${index + 1}/package.json`,
    content: badJson,
    expect: badJson,
  })),
  args: ['*/package.json', '--check'],
  message: 'Should report 2 files.',
})

test('run `cli` on 2 good files and 2 bad files', macro.testCLI, {
  fixtures: [
    ...Array.from({ length: 2 }, (_, index) => ({
      file: `bad-${index + 1}/package.json`,
      content: badJson,
      expect: goodJson,
    })),
    ...Array.from({ length: 2 }, (_, index) => ({
      file: `good-${index + 1}/package.json`,
      content: goodJson,
      expect: goodJson,
    })),
  ],
  args: ['*/package.json'],
  message: 'Should format 2 files.',
})

test('run `cli --check` on 2 good files and 2 bad files', macro.testCLI, {
  fixtures: [
    ...Array.from({ length: 2 }, (_, index) => ({
      file: `bad-${index + 1}/package.json`,
      content: badJson,
      expect: badJson,
    })),
    ...Array.from({ length: 2 }, (_, index) => ({
      file: `good-${index + 1}/package.json`,
      content: goodJson,
      expect: goodJson,
    })),
  ],
  args: ['*/package.json', '--check'],
  message: 'Should report 2 files.',
})

test('run `cli` on none exists file', macro.testCLI, {
  fixtures: [
    {
      file: 'package.json',
      content: badJson,
      expect: badJson,
    },
  ],
  args: ['NONE_EXISTS_FILE'],
  message: 'Should report no files matching.',
})

test('run `cli --check` on none exists file', macro.testCLI, {
  fixtures: [
    {
      file: 'package.json',
      content: badJson,
      expect: badJson,
    },
  ],
  args: ['NONE_EXISTS_FILE', '--check'],
  message: 'Should report no files matching.',
})

test('run `cli` on duplicate patterns', macro.testCLI, {
  fixtures: [
    {
      file: 'bad-1/package.json',
      content: badJson,
      expect: goodJson,
    },
    {
      file: 'good-1/package.json',
      content: goodJson,
      expect: goodJson,
    },
    {
      file: 'good-2/package.json',
      content: goodJson,
      expect: goodJson,
    },
  ],
  args: [
    'bad-1/package.json',
    'bad-1/package.json',
    'bad-*/package.json',
    '*/package.json',
  ],
  message: 'Should not format `bad-1/package.json` more than once.',
})

test('run `cli --check` on duplicate patterns', macro.testCLI, {
  fixtures: [
    {
      file: 'bad-1/package.json',
      content: badJson,
      expect: badJson,
    },
    {
      file: 'good-1/package.json',
      content: goodJson,
      expect: goodJson,
    },
    {
      file: 'good-2/package.json',
      content: goodJson,
      expect: goodJson,
    },
  ],
  args: [
    'bad-1/package.json',
    'bad-1/package.json',
    'bad-*/package.json',
    '*/package.json',
    '--check',
  ],
  message: 'Should not list `bad-1/package.json` more than once.',
})
