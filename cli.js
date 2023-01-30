#!/usr/bin/env node
import { globbyStream } from 'globby'
import fs from 'node:fs/promises'
import sortPackageJson from './index.js'
import Reporter from './reporter.js'

async function showVersion() {
  const { name, version } = JSON.parse(
    await fs.readFile(new URL('package.json', import.meta.url)),
  )

  console.log(`${name} ${version}`)
}

function showHelpInformation() {
  console.log(
    `Usage: sort-package-json [options] [file/glob ...]

Sort package.json files.
If file/glob is omitted, './package.json' file will be processed.

  -c, --check   Check if files are sorted
  -q, --quiet   Don't output success messages
  -h, --help    Display this help
  -v, --version Display the package version
  `,
  )
}

async function sortPackageJsonFile(file, reporter, isCheck) {
  const original = await fs.readFile(file, 'utf8')
  const sorted = sortPackageJson(original)
  if (sorted === original) {
    return reporter.reportNotChanged(file)
  }

  if (!isCheck) {
    await fs.writeFile(file, sorted)
  }

  reporter.reportChanged(file)
}

async function sortPackageJsonFiles(patterns, options) {
  const reporter = new Reporter(options)
  const { isCheck } = options

  for await (const file of globbyStream(patterns)) {
    reporter.reportFound(file)

    try {
      await sortPackageJsonFile(file, reporter, isCheck)
    } catch (error) {
      reporter.reportFailed(file, error)
    }
  }

  reporter.printSummary()
}

async function run() {
  const cliArguments = process.argv.slice(2)

  if (
    cliArguments.some((argument) => argument === '--help' || argument === '-h')
  ) {
    return showHelpInformation()
  }

  if (
    cliArguments.some(
      (argument) => argument === '--version' || argument === '-v',
    )
  ) {
    return showVersion()
  }

  const patterns = []
  let isCheck = false
  let shouldBeQuiet = false

  for (const argument of cliArguments) {
    if (argument === '--check' || argument === '-c') {
      isCheck = true
    } else if (argument === '--quiet' || argument === '-q') {
      shouldBeQuiet = true
    } else {
      patterns.push(argument)
    }
  }

  if (!patterns.length) {
    patterns[0] = 'package.json'
  }

  await sortPackageJsonFiles(patterns, { isCheck, shouldBeQuiet })
}

await run()
