#!/usr/bin/env node
import { globSync } from 'tinyglobby'
import fs from 'node:fs'
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
  const cliArguments = process.argv
    .slice(2)
    .map((arg) => arg.split('='))
    .flat()

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

  if (cliArguments.some((argument) => argument === '--stdin')) {
    return sortPackageJsonFromStdin()
  }

  const patterns = []
  const ignore = []
  let isCheck = false
  let shouldBeQuiet = false

  let lastArg
  for (const argument of cliArguments) {
    if (lastArg === '--ignore' || lastArg === '-i') {
      ignore.push(argument)
      lastArg = undefined
      continue
    }
    if (argument === '--check' || argument === '-c') {
      isCheck = true
    } else if (argument === '--quiet' || argument === '-q') {
      shouldBeQuiet = true
    } else if (argument === '--ignore' || argument === '-i') {
      lastArg = argument
    } else {
      patterns.push(argument)
    }
  }

  if (!patterns.length) {
    patterns[0] = 'package.json'
  }

  if (!ignore.length) {
    ignore[0] = 'node_modules'
  }

  sortPackageJsonFiles(patterns, { ignore, isCheck, shouldBeQuiet })
}

run()
