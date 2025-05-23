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

test('run `cli --help --quiet`', macro.testCLI, {
  args: ['--help', '--quiet'],
  message: 'Should report help menu overriding quiet.',
})

test('run `cli -h`', macro.testCLI, {
  args: ['-h'],
  message: 'Should support help alias.',
})

test('run `cli --help` with other arguments', macro.testCLI, {
  args: ['NONE_EXISTS_FILE', '--help'],
  message: 'Should prioritize help argument.',
})

test('run `cli --version`', macro.testCLI, {
  args: ['--version'],
  message: 'Should report version number.',
})

test('run `cli --version --quiet`', macro.testCLI, {
  args: ['--version', '--quiet'],
  message: 'Should report version overriding quiet.',
})

test('run `cli -v`', macro.testCLI, {
  args: ['-v'],
  message: 'Should support version alias.',
})

test('run `cli --version` with other arguments', macro.testCLI, {
  args: ['NONE_EXISTS_FILE', '--version'],
  message: 'Should prioritize version argument.',
})

test('run `cli --help` with `--version`', macro.testCLI, {
  args: ['--version', '--help'],
  message: 'Should prioritize help over version.',
})

test('run `cli --help=value`', macro.testCLI, {
  args: ['--help=value'],
  message: 'Should report illegal argument and suggest help.',
})

test('run `cli --version=true`', macro.testCLI, {
  args: ['--version=true'],
  message: 'Should report illegal argument and suggest help.',
})

test('run `cli --unknown-option`', macro.testCLI, {
  args: ['--unknown-option'],
  message: 'Should report unknown option and suggest help.',
})

test('run `cli -u` with unknown option', macro.testCLI, {
  args: ['-u'],
  message: 'Should report unknown option and suggest help.',
})

test('run `cli --no-version`', macro.testCLI, {
  args: ['--no-version'],
  message: 'A snapshot to show how `--no-*` works, not care about result.',
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

test('run `cli --quiet=value`', macro.testCLI, {
  args: ['--quiet=value'],
  message: 'Should report illegal argument and suggest help.',
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

test('run `cli --check=value`', macro.testCLI, {
  args: ['--check=value'],
  message: 'Should report illegal argument and suggest help.',
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

test('run `cli -cq` with no patterns', macro.testCLI, {
  fixtures: [
    {
      file: 'package.json',
      content: badJson,
      expect: badJson,
    },
  ],
  args: ['-cq'],
  message: 'Should support option aggregation',
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

test('run `cli --quiet` on 2 bad files', macro.testCLI, {
  fixtures: Array.from({ length: 2 }, (_, index) => ({
    file: `bad-${index + 1}/package.json`,
    content: badJson,
    expect: goodJson,
  })),
  args: ['*/package.json', '--quiet'],
  message: 'Should format 2 files without messages.',
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

const badFormat = ''

test('run `cli --check` on 1 non-json file', macro.testCLI, {
  fixtures: [
    {
      file: 'notJson/package.json',
      content: badFormat,
      expect: badFormat,
    },
  ],
  args: ['*/package.json', '--check'],
  message: 'Should fail to check, but not end execution.',
})

test('run `cli --check --quiet` on 1 non-json file', macro.testCLI, {
  fixtures: [
    {
      file: 'notJson/package.json',
      content: badFormat,
      expect: badFormat,
    },
  ],
  args: ['*/package.json', '--check', '--quiet'],
  message: 'Should output error message, but not count.',
})

test('run `cli` on 1 non-json file', macro.testCLI, {
  fixtures: [
    {
      file: 'notJson/package.json',
      content: badFormat,
      expect: badFormat,
    },
  ],
  args: ['*/package.json'],
  message: 'Should fail to check, but not end execution.',
})

test('run `cli --quiet` on 1 non-json file', macro.testCLI, {
  fixtures: [
    {
      file: 'notJson/package.json',
      content: badFormat,
      expect: badFormat,
    },
  ],
  args: ['*/package.json', '--quiet'],
  message: 'Should output error message',
})

test('run `cli --stdin` with input from stdin', macro.testCLI, {
  args: ['--stdin'],
  message: 'Should output sorted json',
  stdin: `{\n  "description": "Description",\n  "name": "Name"\n}\n`,
})

test('run `cli --stdin` with input from stdin with \\r\\n', macro.testCLI, {
  args: ['--stdin'],
  message: 'The line feed should be CRLF in output',
  stdin: `{\r\n  "description": "Description",\r\n  "name": "Name"\r\n}\r\n`,
})

test('run `cli --ignore=abc`', macro.testCLI, {
  args: ['--ignore=abc'],
  message: 'Should not fail on adding ignore pattern',
})
