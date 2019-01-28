const assert = require('assert');
const sortPackageJson = require('./');
const fs = require('fs');

fs.readFile('./package.json', 'utf8', (error, contents) => {
  if (error) {
    console.error(error.stack || error);
    process.exit(1);
  }
  const parsed = JSON.parse(contents);
  assert.deepEqual(
    typeof sortPackageJson(parsed),
    'object',
    'Accepts object, returns object'
  );
  assert.equal(
    `${JSON.stringify(sortPackageJson(parsed), null, 2)}\n`,
    contents,
    'Returned object is sorted'
  );
  assert.equal(
    sortPackageJson(contents),
    contents,
    'Accepts string, returns sorted string'
  );

  assert.equal(
    JSON.stringify(
      sortPackageJson({
        dependencies: {},
        version: '1.0.0',
        keywords: ['thing'],
        name: 'foo',
        private: true
      }),
      null,
      2
    ),
    '{\n  "name": "foo",\n  "version": "1.0.0",\n  "private": true,\n  "keywords": [\n    "thing"\n  ],\n  "dependencies": {}\n}'
  );

  assert.deepEqual(
    Object.keys(
      sortPackageJson({
        scripts: {
          test: 'node test.js',
          multiply: '2 * 3', // between p(ostinstall) and install
          watch: 'watch things',
          prewatch: 'echo "about to watch"',
          postinstall: 'echo "Installed"',
          start: 'node server.js',
          posttest: 'abc',
          pretest: 'xyz',
          postprettier: 'echo "so pretty"',
          preprettier: 'echo "not pretty"',
          prettier: 'prettier -l "**/*.js"',
          prepare: 'npm run build',
          'pre-fetch-info': 'foo'
        }
      }).scripts
    ),
    [
      'postinstall',
      'multiply',
      'pre-fetch-info',
      'prepare',
      'preprettier',
      'prettier',
      'postprettier',
      'start',
      'pretest',
      'test',
      'posttest',
      'prewatch',
      'watch'
    ]
  );

  assert.equal(sortPackageJson('{}\n'), '{}\n');
  assert.equal(sortPackageJson('{"foo":"bar"}\n'), '{"foo":"bar"}\n');

  assert.equal(
    sortPackageJson('{\n  "foo": "bar"\n}\n'),
    '{\n  "foo": "bar"\n}\n'
  );
  assert.equal(
    sortPackageJson('{\n     "name": "foo",\n "version": "1.0.0"\n}'),
    '{\n     "name": "foo",\n     "version": "1.0.0"\n}'
  );
});
