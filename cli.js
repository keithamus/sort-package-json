#!/usr/bin/env node
import fs from 'node:fs'
import { globbySync } from 'globby'
import sortPackageJson from './index.js'

const isCheckFlag = (argument) => argument === '--check' || argument === '-c'
const isQuietFlag = (argument) => argument === '--quiet' || argument === '-q'

const cliArguments = process.argv.slice(2)
const isCheck = cliArguments.some(isCheckFlag)
const isQuiet = cliArguments.some(isQuietFlag)

function stdout(outputIfTTY = '', alwaysOutput = outputIfTTY) {
  if (isQuiet) return
  const isTerminal = !!process.stdout.isTTY
  if (isTerminal) {
    console.log(outputIfTTY)
  } else if (alwaysOutput !== null) {
    console.log(alwaysOutput)
  }
}

function stderr(outputIfTTY = '', alwaysOutput = outputIfTTY) {
  if (isQuiet) return
  const isTerminal = !!process.stdout.isTTY
  if (isTerminal) {
    console.error(outputIfTTY)
  } else if (alwaysOutput !== null) {
    console.error(alwaysOutput)
  }
}

const patterns = cliArguments.filter((argument) => !isCheckFlag(argument))

if (!patterns.length) {
  patterns[0] = 'package.json'
}

const files = globbySync(patterns)

if (files.length === 0) {
  stderr('No matching files.')
  process.exit(1)
}

let notSortedFiles = 0

files.forEach((file) => {
  const packageJson = fs.readFileSync(file, 'utf8')
  const sorted = sortPackageJson(packageJson)

  if (sorted !== packageJson) {
    if (isCheck) {
      notSortedFiles++
      stdout(file)
    } else {
      fs.writeFileSync(file, sorted, 'utf8')
      stdout(`${file} is sorted!`)
    }
  }
})

if (isCheck) {
  stdout()
  if (notSortedFiles) {
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
  process.exit(notSortedFiles)
}
