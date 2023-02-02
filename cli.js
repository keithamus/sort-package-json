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
  const { values: options, positionals: patterns } = parseArgs({
    options: {
      check: { type: 'boolean', short: 'c', default: false },
      quiet: { type: 'boolean', short: 'q', default: false },
      version: { type: 'boolean', short: 'v', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    allowPositionals: true,
    strict: true,
  })

  if (!patterns.length) {
    patterns[0] = 'package.json'
  }

  return { options, patterns }
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
  let options, patterns
  try {
    ;({ options, patterns } = parseCliArguments())
  } catch (error) {
    process.exitCode = 2
    console.error(error.message)
    if (error.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION') {
      console.error(`Try 'sort-package-json --help' for more information.`)
    }
    return
  }

  if (options.help) {
    return showHelpInformation()
  }

  if (options.version) {
    return showVersion()
  }

  sortPackageJsonFiles(patterns, {
    isCheck: options.check,
    shouldBeQuiet: options.quiet,
  })
}

run()
