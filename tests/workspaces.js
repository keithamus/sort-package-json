import test from 'ava'
import { sortPackageJsonAsObject } from './_helpers.js'

test('workspaces object should be sorted', (t) => {
  const sortedWorkspaces = sortPackageJsonAsObject({
    path: 'workspaces',
    value: {
      zoo: '*', // other property
      packages: ['packages/c', 'packages/a', 'packages/b', 'packages/a'],
      catalog: {
        'is-even': 'npm:is-even@1.0.0',
        'is-odd': 'npm:is-odd@3.0.1',
        'alpha-lib': 'npm:alpha-lib@1.0.0',
      },
      animal: '*', // other property
    },
  })

  const expect = {
    packages: ['packages/a', 'packages/b', 'packages/c'],
    catalog: {
      'alpha-lib': 'npm:alpha-lib@1.0.0',
      'is-even': 'npm:is-even@1.0.0',
      'is-odd': 'npm:is-odd@3.0.1',
    },
    animal: '*',
    zoo: '*',
  }

  t.deepEqual(sortedWorkspaces, expect)
})

test('workspaces with other types should be kept as it is', (t) => {
  for (const value of ['string', false, 2020, undefined, null]) {
    const type = value === null ? 'null' : typeof value
    t.is(
      sortPackageJsonAsObject({ path: 'workspaces', value }),
      value,
      `Should keep ${type} type \`workspaces\` as it is.`,
    )
  }
})
