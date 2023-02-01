#!/usr/bin/env node
import { globbySync } from 'globby'
import fs from 'node:fs'
import { parseArgs } from 'node:util'
import sortPackageJson from './index.js'
import Reporter from './reporter.js'

function showVersion() {
  const { name, version } = JSON.parse(
    fs.readFileSync(new URL('package.json', import.meta.url)),
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

function parseCliArguments() {
  try {
    return parseArgs({
      options: {
        check: { type: 'boolean', short: 'c' },
        quiet: { type: 'boolean', short: 'q' },
        version: { type: 'boolean', short: 'v' },
        help: { type: 'boolean', short: 'h' },
      },
      allowPositionals: true,
      strict: true,
    })
  } catch (err) {
    const { message } = err
    console.error(message)
    process.exit(2)
  }
}

function sortPackageJsonFile(file, reporter, isCheck) {
  const original = fs.readFileSync(file, 'utf8')
  const sorted = sortPackageJson(original)
  if (sorted === original) {
    return reporter.reportNotChanged(file)
  }

  if (!isCheck) {
    fs.writeFileSync(file, sorted)
  }

  reporter.reportChanged(file)
}

function sortPackageJsonFiles(patterns, options) {
  const files = globbySync(patterns)
  const reporter = new Reporter(files, options)
  const { isCheck } = options

  for (const file of files) {
    try {
      sortPackageJsonFile(file, reporter, isCheck)
    } catch (error) {
      reporter.reportFailed(file, error)
    }
  }

  reporter.printSummary()
}

function run() {
  const cliArguments = parseCliArguments()

  if (cliArguments.values.help) {
    return showHelpInformation()
  }

  if (cliArguments.values.version) {
    return showVersion()
  }

  const patterns = cliArguments.positionals
  const isCheck = !!cliArguments.values.check
  const shouldBeQuiet = !!cliArguments.values.quiet

  if (!patterns.length) {
    patterns[0] = 'package.json'
  }

  sortPackageJsonFiles(patterns, { isCheck, shouldBeQuiet })
}

run()
