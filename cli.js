#!/usr/bin/env node
import { globbySync } from 'globby'
import fs from 'node:fs'
import sortPackageJson from './index.js'

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

class Reporter {
  #hasPrinted = false
  #options
  #status
  #logger

  constructor(options) {
    this.#options = options
    this.#status = {
      failedFilesCount: 0,
      wellSortedFilesCount: 0,
      changedFilesCount: 0,
    }

    this.#logger = options.shouldBeQuiet
      ? { log() {}, error() {} }
      : {
          log: (...args) => {
            this.#hasPrinted = true
            console.log(...args)
          },
          error: (...args) => {
            this.#hasPrinted = true
            console.error(...args)
          },
        }
  }

  // The file is well-sorted
  reportNotChanged(/* file */) {
    this.#status.wellSortedFilesCount++
  }

  reportChanged(file) {
    this.#status.changedFilesCount++
    this.#logger.log(this.#options.isCheck ? `${file}` : `${file} is sorted!`)
  }

  reportFailed(file, error) {
    this.#status.failedFilesCount++

    console.error('Error on: ' + file)
    this.#logger.error(error.message)
  }

  printSummary(files) {
    if (files.length === 0) {
      console.error('No matching files.')
      process.exitCode = 2
      return
    }

    const status = this.#status
    const { isCheck, isQuiet } = this.#options

    if (isCheck && status.changedFilesCount) {
      process.exitCode = 1
    }

    if (status.failedFilesCount) {
      process.exitCode = 2
    }

    if (isQuiet) {
      return
    }

    const summary = [
      `Found ${files.length} files.`,
      isCheck
        ? `${status.failedFilesCount} files could not be checked.`
        : `${status.failedFilesCount} files could not be sorted.`,
      isCheck
        ? `${status.changedFilesCount} files were not sorted.`
        : `${status.changedFilesCount} files successfully sorted.`,
      `${status.wellSortedFilesCount} files were already sorted.`,
    ].join('\n')

    this.#logger.log((this.#hasPrinted ? '\n' : '') + summary)
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

function sortPackageJsonFiles(patterns, { isCheck, shouldBeQuiet }) {
  const reporter = new Reporter({ isCheck, shouldBeQuiet })

  const files = globbySync(patterns)

  for (const file of files) {
    try {
      sortPackageJsonFile(file, reporter, isCheck)
    } catch (error) {
      reporter.reportFailed(file, error)
    }
  }

  reporter.printSummary(files)
}

function run() {
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

  sortPackageJsonFiles(patterns, { isCheck, shouldBeQuiet })
}

run()
