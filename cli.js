#!/usr/bin/env node
import { globbySync } from 'globby'
import fs from 'node:fs'
import sortPackageJson from './index.js'

const isCheckFlag = (argument) => argument === '--check' || argument === '-c'
const isHelpFlag = (argument) => argument === '--help' || argument === '-h'
const isVersionFlag = (argument) =>
  argument === '--version' || argument === '-V'

const cliArguments = process.argv.slice(2)
const isCheck = cliArguments.some(isCheckFlag)
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
  -V, --version              display the version and exit
  `,
  )
  process.exit(0)
}

if (isVersion) {
  try {
    const cliRealPath = fs.realpathSync(process.argv[1])
    const cliParentDir = (await import('node:path')).dirname(cliRealPath)
    const packageJsonBuffer = fs.readFileSync(`${cliParentDir}/package.json`)
    const { version } = JSON.parse(packageJsonBuffer)

    console.log(`sort-package-json ${version}`)
  } catch {
    // If anything goes wrong, fall back to 'unknown version'
    console.log(`sort-package-json unknown version`)
  }
  process.exit(0)
}

const patterns = cliArguments.filter((argument) => !isCheckFlag(argument))

if (!patterns.length) {
  patterns[0] = 'package.json'
}

const files = globbySync(patterns)

if (files.length === 0) {
  console.log('No matching files.')
  process.exit(1)
}

let notSortedFiles = 0

files.forEach((file) => {
  const packageJson = fs.readFileSync(file, 'utf8')
  const sorted = sortPackageJson(packageJson)

  if (sorted !== packageJson) {
    if (isCheck) {
      notSortedFiles++
      console.log(file)
    } else {
      fs.writeFileSync(file, sorted, 'utf8')
      console.log(`${file} is sorted!`)
    }
  }
})

if (isCheck) {
  console.log()
  if (notSortedFiles) {
    console.log(
      notSortedFiles === 1
        ? `${notSortedFiles} of ${files.length} matched file is not sorted.`
        : `${notSortedFiles} of ${files.length} matched files are not sorted.`,
    )
  } else {
    console.log(
      files.length === 1
        ? `${files.length} matched file is sorted.`
        : `${files.length} matched files are sorted.`,
    )
  }
  process.exit(notSortedFiles)
}
