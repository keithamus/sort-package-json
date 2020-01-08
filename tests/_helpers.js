const dotProp = require('dot-prop')
const sortPackageJson = require('..')

// object can't compare keys order, so use string to test
const sortPackageJsonAsString = (key, value, pretty) =>
  JSON.stringify(
    sortPackageJson(dotProp.set({}, key, value)),
    null,
    pretty === false ? undefined : 2,
  )

const sortPackageJsonAsObject = (path, value) =>
  dotProp.get(sortPackageJson(dotProp.set({}, path, value)), path)

const keysToObject = keys =>
  keys.reduce((object, key) => Object.assign(object, { [key]: '' }), {})

function sortObjectAlphabetically(t, options) {
  sortObject(t, {
    ...options,
    value: keysToObject(['z', 'a']),
    expected: keysToObject(['a', 'z']),
  })
}

function sortObject(
  t,
  { path, value, expected, message = `Should sort \`${path}\` as object.` },
) {
  if (expected) {
    t.deepEqual(
      sortPackageJsonAsString(path, value),
      JSON.stringify(dotProp.set({}, path, expected), null, 2),
      message,
    )
  } else {
    t.snapshot(sortPackageJsonAsString(path, value), message)
  }
}

function asItIs(t, { path }) {
  t.is(
    sortPackageJsonAsString(path, keysToObject(['z', 'a'])),
    JSON.stringify(dotProp.set({}, path, keysToObject(['z', 'a'])), null, 2),
    `Should keep object type \`${path}\` as it is.`,
  )

  t.deepEqual(
    sortPackageJsonAsObject(path, ['z', 'a', 'a']),
    ['z', 'a', 'a'],
    `Should keep array type \`${path}\` as it is.`,
  )

  for (const value of ['string', false, 2020]) {
    t.is(
      sortPackageJsonAsObject(path, value),
      value,
      `Should keep ${typeof value} type \`${path}\` as it is.`,
    )
  }
}

module.exports = {
  macro: {
    sortObject,
    asItIs,
    sortObjectAlphabetically,
  },
  sortPackageJsonAsObject,
  sortPackageJsonAsString,
  keysToObject,
}
