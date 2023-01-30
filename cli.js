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

function sortPackageJsonFiles(patterns, { isCheck, shouldBeQuiet }) {
  const files = globbySync(patterns)
  const printToStdout = shouldBeQuiet ? () => {} : console.log
  const printToStderr = shouldBeQuiet ? () => {} : console.error

  if (files.length === 0) {
    console.error('No matching files.')
    process.exitCode = 2
    return
  }

  let notSortedFiles = 0
  for (const file of files) {
    let packageJson, sorted
    try {
      packageJson = fs.readFileSync(file, 'utf8')
      sorted = sortPackageJson(packageJson)
    } catch (e) {
      console.error(file)

      printToStderr(e.message)
      continue
    }
    if (sorted !== packageJson) {
      if (isCheck) {
        notSortedFiles++
        printToStdout(file)
        process.exitCode = 1
      } else {
        fs.writeFileSync(file, sorted)

        printToStdout(`${file} is sorted!`)
      }
    }
  }

  if (isCheck) {
    if (notSortedFiles) {
      // Print a empty line only if already printed files
      printToStdout()
      printToStdout(
        notSortedFiles === 1
          ? `${notSortedFiles} of ${files.length} matched file is not sorted.`
          : `${notSortedFiles} of ${files.length} matched files are not sorted.`,
      )
    } else {
      printToStdout(
        files.length === 1
          ? `${files.length} matched file is sorted.`
          : `${files.length} matched files are sorted.`,
      )
    }
  }
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
