const assert = require('assert');
const fs = require('fs');
const newline = require('newline');
const sortPackageJson = require('./');
const { execFile } = require('child_process');

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
          name: 'my-package',
          a: 'a',
          z: 'z',
        },
        {
          sortOrder: ['z', 'a', 'name']
        }
      )
    ),
    ['z', 'a', 'name']
  );

  // Custom sort order should not effect field sorting
  assert.deepEqual(
    Object.keys(
      sortPackageJson(
        {
          scripts: {
            name: 'my-package',
            a: 'a',
            z: 'z',
          }
        },
        {
          sortOrder: ['z', 'a', 'name']
        }
      ).scripts
    ),
    ['a', 'name', 'z']
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


// CLI `--check` flag tests

// make sure `--check` not fixing file
// support `-c` as well
const orignal = fs.readFileSync('fixtures/not-sorted-1/package.json', 'utf8');
execFile(
  'node',
  ['index.js', 'fixtures/not-sorted-1/package.json', '-c'],
  (error, stdout, stderr) => {
    assert.notEqual(
      orignal,
      sortPackageJson(orignal),
      'fixtures/not-sorted-1/package.json should be a unsorted file.'
    );
    assert.equal(
      orignal,
      fs.readFileSync('fixtures/not-sorted-1/package.json', 'utf8'),
      'file should not fixed when --check is enabled.'
    );
    assert.equal(error.code, 1, 'error.code should equals to unsorted file length');
    assert.equal(stderr, '');
    assert.equal(stdout.trim(), 'fixtures/not-sorted-1/package.json\n1 file is not sorted.');
  }
);


execFile(
  'node',
  ['index.js', 'fixtures/not-sorted-*/package.json','--check'],
  (error, stdout, stderr) => {
    assert.equal(error.code, 2);
    assert.equal(stderr, '');
    assert.equal(stdout.includes('fixtures/not-sorted-1/package.json'), true);
    assert.equal(stdout.includes('fixtures/not-sorted-2/package.json'), true);
    assert.equal(stdout.includes('2 files are not sorted.'), true);
  }
);

execFile(
  'node',
  ['index.js', 'fixtures/sorted-1/package.json','--check'],
  (error, stdout, stderr) => {
    assert.equal(error, null);
    assert.equal(stderr, '');
    assert.equal(stdout.trim(), 'file is sorted.');
  }
);

execFile(
  'node',
  ['index.js', 'fixtures/sorted-*/package.json','--check'],
  (error, stdout, stderr) => {
    assert.equal(error, null);
    assert.equal(stderr, '');
    assert.equal(stdout.trim(), 'all files are sorted.');
  }
);

execFile(
  'node',
  ['index.js', 'fixtures/*/package.json','--check'],
  (error, stdout, stderr) => {
    assert.equal(error.code, 3);
    assert.equal(stderr, '');
    assert.equal(stdout.includes('fixtures/sorted-1/package.json'), false);
    assert.equal(stdout.includes('fixtures/sorted-2/package.json'), false);
    assert.equal(stdout.includes('fixtures/not-sorted-1/package.json'), true);
    assert.equal(stdout.includes('fixtures/not-sorted-2/package.json'), true);
    assert.equal(stdout.includes('fixtures/another-not-sorted/package.json'), true);
    assert.equal(stdout.includes('3 files are not sorted.'), true);
  }
);
