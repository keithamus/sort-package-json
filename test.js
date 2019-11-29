const assert = require('assert');
const fs = require('fs');
const newline = require('newline');
const sortPackageJson = require('./');

fs.readFile('./package.json', 'utf8', (error, contents) => {
  if (error) {
    console.error(error.stack || error);
    process.exit(1);
  }

  // Enforce LF line-endings. Windows git users often set core.autocrlf
  // to true, so the file may have CRLF line endings.
  contents = newline.set(contents, "LF");

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
      })
    ),
    '{"name":"foo","version":"1.0.0","private":true,"keywords":["thing"],"dependencies":{}}'
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

  // Custom sort order
  assert.deepEqual(
    Object.keys(
      sortPackageJson(
        {
          scripts: {
            name: 'my-package',
            engines: '>=10'
          }
        },
        {
          sortOrder: ['engines', 'name']
        }
      ).scripts
    ),
    ['engines', 'name']
  );

  assert.equal(sortPackageJson('{}'), '{}');
  assert.equal(sortPackageJson('{}\n'), '{}\n');
  assert.equal(sortPackageJson('{}\r\n'), '{}\r\n');
  assert.equal(sortPackageJson('{"foo":"bar"}\n'), '{"foo":"bar"}\n');

  assert.equal(
    sortPackageJson('{\n  "foo": "bar"\n}\n'),
    '{\n  "foo": "bar"\n}\n'
  );
  assert.equal(
    sortPackageJson('{\n     "name": "foo",\n "version": "1.0.0"\n}'),
    '{\n     "name": "foo",\n     "version": "1.0.0"\n}'
  );
  assert.equal(
    sortPackageJson('{\r\n  "foo": "bar"\r\n}\r\n'),
    '{\r\n  "foo": "bar"\r\n}\r\n'
  );
});

