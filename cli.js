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
  const status = isCheck
    ? { failed: 0, sorted: 0, notSorted: 0, hasPrinted: false }
    : { failed: 0, succeeded: 0, notChanged: 0, hasPrinted: false }

  const files = globbySync(patterns)
  const printToStdout = shouldBeQuiet ? () => {} : console.log
  const printToStderr = shouldBeQuiet ? () => {} : console.error

  if (files.length === 0) {
    console.error('No matching files.')
    process.exitCode = 2
    return
  }

  function handleError({ file, error }) {
    status.failed++
    status.hasPrinted = true

    console.error('Error on: ' + file)
    printToStderr(error.message)
  }

  for (const file of files) {
    let packageJson, sorted
    try {
      packageJson = fs.readFileSync(file, 'utf8')
      sorted = sortPackageJson(packageJson)
    } catch (error) {
      handleError({ file, error })
      continue
    }

    if (sorted === packageJson) {
      // Already sorted
      if (isCheck) status.sorted++
      else status.notChanged++
    } else if (isCheck) {
      // Checking files, not already sorted
      status.notSorted++
      status.hasPrinted = true
      printToStdout(file)
    } else {
      // Not check, not already sorted
      try {
        fs.writeFileSync(file, sorted)
        status.succeeded++
        status.hasPrinted = true
        printToStdout(`${file} is sorted!`)
      } catch (error) {
        handleError({ file, error })
        continue
      }
    }
  } // End loop

  if (isCheck) {
    const statusOutput =
      `Found ${files.length} files.\n` +
      `${status.failed} files could not be checked.\n` +
      `${status.notSorted} files were not sorted.\n` +
      `${status.sorted} files were already sorted.`
    if (status.hasPrinted) printToStdout('')
    printToStdout(statusOutput)

    if (status.notSorted > 0) {
      process.exitCode = 1
    }
  } else {
    const statusOutput =
      `Found ${files.length} files.\n` +
      `${status.failed} files could not be sorted.\n` +
      `${status.succeeded} files successfully sorted.\n` +
      `${status.notChanged} files were already sorted.`

    if (status.hasPrinted) printToStdout('')
    printToStdout(statusOutput)
  }

  if (status.failed > 0) {
    process.exitCode = 2
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
