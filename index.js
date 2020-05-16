const fs = require('fs-extra');
const path = require('path');

async function copyTheme(dstDir) {
  const exists = await fs.exists(dstDir);
  if (exists) {
    await fs.remove(dstDir);
  }
  await fs.mkdirp(dstDir);
  await fs.copy(path.join(__dirname, 'build'), dstDir);
}

module.exports = {
  copyTheme,
};