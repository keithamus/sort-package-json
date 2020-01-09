import test from 'ava'
import sortPackageJson from '..'
import { runCLI, cliScript, macro } from './_helpers'
import fs from 'fs'

test('cli', t => {
  t.notThrows(
    () => fs.accessSync(cliScript, fs.constants.X_OK),
    'CLI should be executable',
  )
})

for (const flag of ['--check', '-c']) {
  test(`run \`cli ${flag}\``, async t => {
    const fixture = 'fixtures/not-sorted-1/package.json'
    const original = fs.readFileSync(fixture, 'utf8')
    await runCLI([fixture, flag])

    t.not(
      original,
      sortPackageJson(original),
      `\`${fixture}\` should not be a unsorted file.`,
    )

    t.is(
      fs.readFileSync(fixture, 'utf8'),
      original,
      `\`${fixture}\` should not fixed when --check is enabled.`,
    )
  })
}

test(
  'run `cli --check` on single unsorted file',
  macro.testCLI,
  ['fixtures/not-sorted-1/package.json', '--check'],
  'Should report 1 file is not sorted',
)

test(
  'run `cli --check` on many unsorted file',
  macro.testCLI,
  ['fixtures/not-sorted-*/package.json', '--check'],
  'Should report all files are not sorted',
)

test(
  'run `cli --check` on single sorted file',
  macro.testCLI,
  ['fixtures/sorted-1/package.json', '--check'],
  'Should report 1 file is sorted',
)

test(
  'run `cli --check` on many sorted file',
  macro.testCLI,
  ['fixtures/sorted-*/package.json', '--check'],
  'Should report all files are sorted',
)

test(
  'run `cli --check` on sorted and unsorted file',
  macro.testCLI,
  ['fixtures/*/package.json', '--check'],
  'Should report some files are not sorted',
)

test(
  'run `cli --check` on none exists file',
  macro.testCLI,
  ['NONE_EXISTS_FILE', '--check'],
  'Should report no files matching.',
)

test(
  'run `cli --check` on duplicate patterns',
  macro.testCLI,
  [
    'fixtures/not-sorted-1/package.json',
    'fixtures/not-sorted-1/package.json',
    'fixtures/not-sorted-*/package.json',
    '--check',
  ],
  'Should not list `fixtures/not-sorted-1/package.json` more than once',
)
