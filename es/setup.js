const fs = require('fs');
const path = require('path');
var copyRecursiveSync = function (src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    try {
      fs.mkdirSync(dest);
    } catch (e) {}
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
    } else {
      console.log(`file already present ${dest}`);
    }
  }
};

copyRecursiveSync(path.resolve(__dirname, '../setup'), process.cwd());

console.log(`
Your kraft App is ready to go!
now run:
npm i express react-dom@18.2.0
`);
