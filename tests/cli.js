import test from 'ava'
import fs from 'node:fs'
import { cliScript, macro } from './_helpers.js'

const badJson = {
  version: '1.0.0',
  name: 'sort-package-json',
}
const goodJson = {
  name: 'sort-package-json',
  version: '1.0.0',
}

test('cli', (t) => {
  t.notThrows(
    () => fs.accessSync(cliScript, fs.constants.X_OK),
    'CLI should be executable.',
  )
})

test('run `cli --help`', macro.testCLI, {
  args: ['--help'],
  message: 'Should report help menu.',
})

test('run `cli -h`', macro.testCLI, {
  args: ['-h'],
  message: 'Should support help alias.',
})

test('run `cli --help --quiet`', macro.testCLI, {
  args: ['--help', '--quiet'],
  message: 'Should report help menu overriding quiet.',
})

test('run `cli --help` without TTY', macro.testCLI, {
  args: ['--help'],
  message: 'Should report help menu regardless of TTY.',
  isTerminal: { stdout: false, stderr: false },
})

test('run `cli --help` with other arguments', macro.testCLI, {
  args: ['NONE_EXISTS_FILE', '--help'],
  message: 'Should prioritize help argument.',
})

test('run `cli --version`', macro.testCLI, {
  args: ['--version'],
  message: 'Should report version number.',
})

test('run `cli -v`', macro.testCLI, {
  args: ['-v'],
  message: 'Should support version alias.',
})

test('run `cli --version --quiet`', macro.testCLI, {
  args: ['--version', '--quiet'],
  message: 'Should report version overriding quiet.',
})

test('run `cli --version` without TTY', macro.testCLI, {
  args: ['--version'],
  message: 'Should report version number regardless of TTY.',
  isTerminal: { stdout: false, stderr: false },
})

test('run `cli --version` with other arguments', macro.testCLI, {
  args: ['NONE_EXISTS_FILE', '--version'],
  message: 'Should prioritize version argument.',
})

test('run `cli --help` with `--version`', macro.testCLI, {
  args: ['--version', '--help'],
  message: 'Should prioritize help over version.',
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

test('run `cli --quiet` with no patterns', macro.testCLI, {
  fixtures: [
    {
      file: 'package.json',
      content: badJson,
      expect: goodJson,
    },
  ],
  args: ['--quiet'],
  message: 'Should format package.json without message.',
})

test('run `cli -q` with no patterns', macro.testCLI, {
  fixtures: [
    {
      file: 'package.json',
      content: badJson,
      expect: goodJson,
    },
  ],
  args: ['-q'],
  message: 'Should support -q alias.',
})

test('run `cli` with no patterns and no TTY', macro.testCLI, {
  fixtures: [
    {
      file: 'package.json',
      content: badJson,
      expect: goodJson,
    },
  ],
  args: [],
  message: 'Should format package.json, output only file name.',
  isTerminal: { stdout: false, stderr: false },
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
  message: 'Should not sort package.json',
})

test('run `cli --check --quiet` with no patterns', macro.testCLI, {
  fixtures: [
    {
      file: 'package.json',
      content: badJson,
      expect: badJson,
    },
  ],
  args: ['--check', '--quiet'],
  message: 'Should not sort package.json or report a message.',
})

test('run `cli --check` with no patterns and no TTY', macro.testCLI, {
  fixtures: [
    {
      file: 'package.json',
      content: badJson,
      expect: badJson,
    },
  ],
  args: ['--check'],
  message: 'Should not sort package.json. Output only filename',
  isTerminal: { stdout: false, stderr: false },
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

test('run `cli -c -q` with no patterns', macro.testCLI, {
  fixtures: [
    {
      file: 'package.json',
      content: badJson,
      expect: badJson,
    },
  ],
  args: ['-c', '-q'],
  message: 'Should support `-q` alias',
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

test('run `cli --quiet` on 1 bad file', macro.testCLI, {
  fixtures: [
    {
      file: 'bad/package.json',
      content: badJson,
      expect: goodJson,
    },
  ],
  args: ['*/package.json', '--quiet'],
  message: 'Should format 1 file without message.',
})

test('run `cli` on 1 bad file without TTY', macro.testCLI, {
  fixtures: [
    {
      file: 'bad/package.json',
      content: badJson,
      expect: goodJson,
    },
  ],
  args: ['*/package.json'],
  message: 'Should format 1 file, output only file name.',
  isTerminal: { stdout: false, stderr: false },
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

test('run `cli --check --quiet` on 1 bad file', macro.testCLI, {
  fixtures: [
    {
      file: 'bad/package.json',
      content: badJson,
      expect: badJson,
    },
  ],
  args: ['*/package.json', '--check', '--quiet'],
  message: 'Should exit code 1 without report.',
})

test('run `cli --check` on 1 bad file without TTY', macro.testCLI, {
  fixtures: [
    {
      file: 'bad/package.json',
      content: badJson,
      expect: badJson,
    },
  ],
  args: ['*/package.json', '--check'],
  message: 'Should report 1 file. Output only filename',
  isTerminal: { stdout: false, stderr: false },
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

test('run `cli --quiet` on 2 bad files', macro.testCLI, {
  fixtures: Array.from({ length: 2 }, (_, index) => ({
    file: `bad-${index + 1}/package.json`,
    content: badJson,
    expect: goodJson,
  })),
  args: ['*/package.json', '--quiet'],
  message: 'Should format 2 files without messages.',
})

test('run `cli` on 2 bad files without TTY', macro.testCLI, {
  fixtures: Array.from({ length: 2 }, (_, index) => ({
    file: `bad-${index + 1}/package.json`,
    content: badJson,
    expect: goodJson,
  })),
  args: ['*/package.json'],
  message: 'Should format 2 files outputting only filenames.',
  isTerminal: { stdout: false, stderr: false },
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

test('run `cli --check --quiet` on 2 bad files', macro.testCLI, {
  fixtures: Array.from({ length: 2 }, (_, index) => ({
    file: `bad-${index + 1}/package.json`,
    content: badJson,
    expect: badJson,
  })),
  args: ['*/package.json', '--check', '--quiet'],
  message: 'Should exit code 2.',
})

test('run `cli --check` on 2 bad files without TTY', macro.testCLI, {
  fixtures: Array.from({ length: 2 }, (_, index) => ({
    file: `bad-${index + 1}/package.json`,
    content: badJson,
    expect: badJson,
  })),
  args: ['*/package.json', '--check'],
  message: 'Should output 2 files and exit code 2.',
  isTerminal: { stdout: false, stderr: false },
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

test('run `cli --quiet` on 2 good files and 2 bad files', macro.testCLI, {
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
  args: ['*/package.json', '--quiet'],
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

test(
  'run `cli --check --quiet` on 2 good files and 2 bad files',
  macro.testCLI,
  {
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
    args: ['*/package.json', '--check', '--quiet'],
    message: 'Should exit code 2.',
  },
)

test(
  'run `cli --check` on 2 good files and 2 bad files without stdout TTY',
  macro.testCLI,
  {
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
    message: 'Should output bad files on stdout and exit code 2.',
    isTerminal: { stderr: true, stdout: false },
  },
)

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

test('run `cli --quiet` on none exists file', macro.testCLI, {
  fixtures: [
    {
      file: 'package.json',
      content: badJson,
      expect: badJson,
    },
  ],
  args: ['NONE_EXISTS_FILE', '--quiet'],
  message: 'Should report no files matching.',
})

test('run `cli` on none exists file without TTY', macro.testCLI, {
  fixtures: [
    {
      file: 'package.json',
      content: badJson,
      expect: badJson,
    },
  ],
  args: ['NONE_EXISTS_FILE'],
  message: 'Should report no files matching regardless of TTY.',
  isTerminal: { stderr: false, stdout: false },
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

test('run `cli --check` on none exists file without TTY', macro.testCLI, {
  fixtures: [
    {
      file: 'package.json',
      content: badJson,
      expect: badJson,
    },
  ],
  args: ['NONE_EXISTS_FILE', '--check'],
  message: 'Should report no files matching regardless of TTY.',
  isTerminal: { stderr: false, stdout: false },
})

test('run `cli --check --quiet` on none exists file', macro.testCLI, {
  fixtures: [
    {
      file: 'package.json',
      content: badJson,
      expect: badJson,
    },
  ],
  args: ['NONE_EXISTS_FILE', '--check', '--quiet'],
  message: 'Should report no files matching regardless of quiet.',
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

test('run `cli --check --quiet` on duplicate patterns', macro.testCLI, {
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
    '--quiet',
  ],
  message: 'Should not count `bad-1/package.json` more than once. Exit code 1',
})

test('run `cli --check` on duplicate patterns without TTY', macro.testCLI, {
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
  message: 'Should not list `bad-1/package.json` more than once. Exit code 1',
  isTerminal: { stderr: false, stdout: false },
})
