#!/usr/bin/env node
import { globSync } from 'tinyglobby'
import fs from 'node:fs'
import { parseArgs } from 'node:util'
import getStdin from 'get-stdin'
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
  -i, --ignore  An array of glob patterns to ignore
  -v, --version Display the package version
  --stdin       Read package.json from stdin
  `,
  )
}

function parseCliArguments() {
  const { values: options, positionals: patterns } = parseArgs({
    options: {
      check: { type: 'boolean', short: 'c', default: false },
      quiet: { type: 'boolean', short: 'q', default: false },
      stdin: { type: 'boolean', default: false },
      ignore: {
        type: 'string',
        short: 'i',
        multiple: true,
        default: ['node_modules/**'],
      },
      version: { type: 'boolean', short: 'v', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    allowPositionals: true,
    strict: true,
  })

  if (patterns.length === 0) {
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

function sortPackageJsonFiles(patterns, { ignore, ...options }) {
  const files = globSync(patterns, { ignore })

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

async function sortPackageJsonFromStdin() {
  process.stdout.write(sortPackageJson(await getStdin()))
}

function run() {
  let options, patterns
  try {
    ;({ options, patterns } = parseCliArguments())
  } catch (error) {
    process.exitCode = 2
    console.error(error.message)
    if (
      error.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION' ||
      error.code === 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE'
    ) {
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

  if (options.stdin) {
    return sortPackageJsonFromStdin()
  }

  sortPackageJsonFiles(patterns, {
    ignore: options.ignore,
    isCheck: options.check,
    shouldBeQuiet: options.quiet,
  })
}

run()
