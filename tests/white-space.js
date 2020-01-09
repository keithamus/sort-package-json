import test from 'ava'
import sortPackageJson from '..'

test('white space', t => {
  t.is(sortPackageJson('{}'), '{}')
  t.is(sortPackageJson('{}\n'), '{}\n')
  t.is(sortPackageJson('{}\r\n'), '{}\r\n')
  t.is(sortPackageJson('{"foo":"bar"}\n'), '{"foo":"bar"}\n')
  t.is(sortPackageJson('{\n  "foo": "bar"\n}\n'), '{\n  "foo": "bar"\n}\n')
  t.is(
    sortPackageJson('{\n     "name": "foo",\n "version": "1.0.0"\n}'),
    '{\n     "name": "foo",\n     "version": "1.0.0"\n}',
  )
  t.is(
    sortPackageJson('{\r\n  "foo": "bar"\r\n}\r\n'),
    '{\r\n  "foo": "bar"\r\n}\r\n',
  )
  t.is(sortPackageJson('{\r\n  "foo": "bar"\n}\n'), '{\n  "foo": "bar"\n}\n')
})
