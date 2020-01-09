import test from 'ava'
import sortPackageJson from '..'
import {
  runCLI,
  cliScript,
  cleanFixtures,
  setupFixtures,
  macro,
} from './_helpers'
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
    'CLI should be executable',
  )
})

for (const flag of ['--check', '-c']) {
  test(`run \`cli ${flag}\``, async t => {
    const { root: cwd, 'bad-1': fixture } = setupFixtures({
      'bad-1': badJson,
    })

    await runCLI({
      args: ['*/package.json', flag],
      cwd,
    })

    t.is(
      fs.readFileSync(fixture, 'utf8'),
      JSON.stringify(badJson, null, 2),
      `\`${fixture}\` should not fixed when --check is enabled.`,
    )

    cleanFixtures(cwd)
  })
}

test('run `cli --check` on single unsorted file', macro.testCLI, {
  fixtures: {
    'bad-1': badJson,
  },
  args: ['*/package.json', '--check'],
  message: 'Should report 1 file is not sorted',
})

test('run `cli --check` on many unsorted file', macro.testCLI, {
  fixtures: {
    'not-sorted-1': badJson,
    'not-sorted-2': badJson,
  },
  args: ['*/package.json', '--check'],
  message: 'Should report all file are not sorted',
})

test('run `cli --check` on single sorted file', macro.testCLI, {
  fixtures: {
    'sorted-1': goodJson,
  },
  args: ['*/package.json', '--check'],
  message: 'Should report 1 file is sorted',
})

test('run `cli --check` on many sorted file', macro.testCLI, {
  fixtures: {
    'sorted-1': goodJson,
    'sorted-2': goodJson,
  },
  args: ['*/package.json', '--check'],
  message: 'Should report all files are sorted',
})

test('run `run `cli --check` on sorted and unsorted file', macro.testCLI, {
  fixtures: {
    'bad-1': badJson,
    'bad-2': badJson,
    'good-1': goodJson,
    'good-2': goodJson,
  },
  args: ['*/package.json', '--check'],
  message: 'Should report some files are not sorted',
})

test('run `cli --check` on none exists file', macro.testCLI, {
  fixtures: {},
  args: ['NONE_EXISTS_FILE', '--check'],
  message: 'Should report no files matching.',
})

test('run `cli --check` on duplicate patterns', macro.testCLI, {
  fixtures: {
    'bad-1': badJson,
    'good-1': goodJson,
    'good-2': goodJson,
  },
  args: [
    'bad-1/package.json',
    'bad-1/package.json',
    'bad-*/package.json',
    '*/package.json',
    '--check',
  ],
  message: 'Should not list `bad-1/package.json` more than once',
})
