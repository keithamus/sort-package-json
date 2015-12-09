var assert = require('assert');
var sortPackageJson = require('./');
require('fs').readFile('./package.json', 'utf8', function (error, contents) {
  if (error) {
    console.error(error.stack || error);
    process.exit(1);
  }
  var parsed = JSON.parse(contents);
  assert.deepEqual(typeof sortPackageJson(parsed), 'object', 'Accepts object, returns object');
  assert.equal(JSON.stringify(sortPackageJson(parsed), null, 2), contents, 'Returned object is sorted');
  assert.equal(sortPackageJson(contents), contents, 'Accepts string, returns sorted string');

  assert.equal(JSON.stringify(sortPackageJson({
    dependencies: {},
    version: '1.0.0',
    keywords: ['thing'],
    name: 'foo',
  }), null, 2), '{\n  "name": "foo",\n  "version": "1.0.0",\n  "keywords": [\n    "thing"\n  ],\n  "dependencies": {}\n}');
});
