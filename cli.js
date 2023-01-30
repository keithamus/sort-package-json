#!/usr/bin/env node
import { globbyStream } from 'globby'
import fs from 'node:fs/promises'
import sortPackageJson from './index.js'

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

async function sortPackageJsonFiles(patterns, { isCheck, shouldBeQuit }) {
  const printToStdout = shouldBeQuit ? () => {} : console.log

  let notSortedFiles = 0
  let matchedFiles = 0
  for await (const file of globbyStream(patterns)) {
    matchedFiles++

    const packageJson = await fs.readFile(file, 'utf8')
    const sorted = sortPackageJson(packageJson)

    if (sorted === packageJson) {
      continue
    }

    notSortedFiles++

    if (isCheck) {
      printToStdout(file)
      process.exitCode = 1
    } else {
      await fs.writeFile(file, sorted)
      printToStdout(`${file} is sorted!`)
    }
  }

  if (matchedFiles === 0) {
    console.error('No matching files.')
    process.exitCode = 2
    return
  }

  if (isCheck) {
    // Print a empty line
    printToStdout()

    if (notSortedFiles) {
      printToStdout(
        notSortedFiles === 1
          ? `${notSortedFiles} of ${matchedFiles} matched file is not sorted.`
          : `${notSortedFiles} of ${matchedFiles} matched files are not sorted.`,
      )
    } else {
      printToStdout(
        matchedFiles === 1
          ? `${matchedFiles} matched file is sorted.`
          : `${matchedFiles} matched files are sorted.`,
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
  let shouldBeQuit = false

  for (const argument of cliArguments) {
    if (argument === '--check' || argument === '-c') {
      isCheck = true
    } else if (argument === '--quiet' || argument === '-q') {
      shouldBeQuit = true
    } else {
      patterns.push(argument)
    }
  }

  if (!patterns.length) {
    patterns[0] = 'package.json'
  }

  return sortPackageJsonFiles(patterns, { isCheck, shouldBeQuit })
}

await run()
