#!/usr/bin/env node
import { globbySync } from 'globby'
import fs from 'node:fs'
import sortPackageJson from './index.js'

const isCheckFlag = (argument) => argument === '--check' || argument === '-c'
const isHelpFlag = (argument) => argument === '--help' || argument === '-h'
const isVersionFlag = (argument) =>
  argument === '--version' || argument === '-v'
const isQuietFlag = (argument) => argument === '--quiet' || argument === '-q'

const cliArguments = process.argv.slice(2)
const isCheck = cliArguments.some(isCheckFlag)
const isQuiet = cliArguments.some(isQuietFlag)

const stdout = isQuiet ? () => {} : console.log
const stderr = isQuiet ? () => {} : console.error

const isHelp = cliArguments.some(isHelpFlag)
const isVersion = cliArguments.some(isVersionFlag)

if (isHelp) {
  console.log(
    `Usage: sort-package-json [OPTION...] [FILE...]
Sort npm package.json files. Default: ./package.json
Strings passed as files are parsed as globs.

  -c, --check                check if FILES are sorted
  -q, --quiet                don't output success messages
  -h, --help                 display this help and exit
  -v, --version              display the version and exit
  `,
  )
  process.exit(0)
}
if (isVersion) {
  const packageJsonUrl = new URL('package.json', import.meta.url)
  const packageJsonBuffer = fs.readFileSync(packageJsonUrl, 'utf8')
  const { version } = JSON.parse(packageJsonBuffer)

  console.log(`sort-package-json ${version}`)
  process.exit(0)
}

const patterns = cliArguments.filter(
  (argument) => !isCheckFlag(argument) && !isQuietFlag(argument),
)

if (!patterns.length) {
  patterns[0] = 'package.json'
}

const files = globbySync(patterns)

if (files.length === 0) {
  stderr('No matching files.')
  process.exit(1)
}

let notSortedFiles = 0

function handleError(error, file) {
  notSortedFiles++
  stderr(`could not ${isCheck ? 'check' : 'sort'} ${file}`)
  stderr(error.message)
}

files.forEach((file) => {
  let sorted, packageJson
  try {
    packageJson = fs.readFileSync(file, 'utf8')
    sorted = sortPackageJson(packageJson)
  } catch (error) {
    handleError(error, file)
    return
  }

  if (sorted !== packageJson) {
    if (isCheck) {
      notSortedFiles++
      stdout(file)
    } else {
      try {
        fs.writeFileSync(file, sorted, 'utf8')
      } catch (error) {
        handleError(error, file)
        return
      }
      stdout(`${file} is sorted!`)
    }
  }
})

if (isCheck) {
  if (notSortedFiles) {
    stdout('')
    stdout(
      notSortedFiles === 1
        ? `${notSortedFiles} of ${files.length} matched file is not sorted.`
        : `${notSortedFiles} of ${files.length} matched files are not sorted.`,
    )
  } else {
    stdout(
      files.length === 1
        ? `${files.length} matched file is sorted.`
        : `${files.length} matched files are sorted.`,
    )
  }
}
process.exit(Math.min(notSortedFiles, 255))
