var assert = require('assert');
var sortPackageJson = require('./');
require('fs').readFile('./package.json', 'utf8', function (error, contents) {
  if (error) {
    console.error(error.stack || error);
    process.exit(1);
  }
  var parsed = JSON.parse(contents);
  assert.deepEqual(typeof sortPackageJson(parsed), 'object', 'Accepts object, returns object');
  assert.equal(JSON.stringify(sortPackageJson(parsed), null, 2) + '\n', contents, 'Returned object is sorted');
  assert.equal(sortPackageJson(contents), contents, 'Accepts string, returns sorted string');

  assert.equal(JSON.stringify(sortPackageJson({
    dependencies: {},
    version: '1.0.0',
    keywords: ['thing'],
    name: 'foo',
    private: true
  }), null, 2), '{\n  "name": "foo",\n  "version": "1.0.0",\n  "private": true,\n  "keywords": [\n    "thing"\n  ],\n  "dependencies": {}\n}');

  assert.deepEqual(Object.keys(sortPackageJson({
    scripts: {
      test: 'node test.js',
      multiply: '2 * 3', // between p(ostinstall) and install
      watch: 'watch things',
      postinstall: 'echo "Installed"',
      start: 'node server.js',
      posttest: 'abc',
      pretest: 'xyz',
    }
  }).scripts), [
    'postinstall',
    'multiply',
    'start',
    'pretest',
    'test',
    'posttest',
    'watch',
  ])

  assert.equal(sortPackageJson('{}\n'), '{}\n');
  assert.equal(sortPackageJson('{"foo":"bar"}\n'), '{\n  "foo": "bar"\n}\n');
});
