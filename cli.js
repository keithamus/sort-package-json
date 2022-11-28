#!/usr/bin/env node
import fs from 'node:fs'
import { globbySync } from 'globby'
import sortPackageJson from './index.js'
import * as yoctocolors from 'yoctocolors'
import { diffLines } from 'diff'

const isCheckFlag = (argument) => argument === '--check' || argument === '-c'

const cliArguments = process.argv.slice(2)
const isCheck = cliArguments.some(isCheckFlag)

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
      const diff = diffLines(packageJson, sorted)
      diff.forEach((part) => {
        const partLineList = part.value.split('\n')
        partLineList.forEach((line, index) => {
          if ((part.added || part.removed) && index === partLineList.length - 1)
            return
          const colorValue = part.added
            ? yoctocolors.green(`+${line}\n`)
            : part.removed
            ? yoctocolors.red(`-${line}\n`)
            : yoctocolors.gray(` ${line}\n`)
          process.stderr.write(colorValue)
        })
      })
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
