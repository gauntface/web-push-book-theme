const fs = require('fs-extra');
const test = require('ava');
const path = require('path');
const os = require('os');
const {copyTheme} = require('../index');
const dircompare = require('dir-compare');

test('copyTheme', async (t) => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'theme'));
  await copyTheme(tmpDir);

  const src = path.join(__dirname, '..', 'build')
  const result = await dircompare.compare(src, tmpDir, {
    compareSize: true,
  })
  if (!result.same) {
    console.log(`Directories are not equal: `, result)
  }
  t.truthy(result.same)
})