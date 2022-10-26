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
console.log(__filename);
// find package.json in root folder
// add scripts
if (fs.existsSync(path.resolve(process.cwd(), 'package.json'))) {
  const packageJson = require(path.resolve(process.cwd(), 'package.json'));
  let scripts = {
    ccr: 'kraftjs --build client',
    ssr: 'kraftjs --build server --prod',
    startServer: 'node public/server',
    set: 'kraftjs --setup',
    dev: 'kraftjs --dev',
  };
  if (packageJson.scripts) {
    scripts = { ...scripts, ...packageJson.scripts };
  }
  packageJson.scripts = scripts;
  fs.writeFileSync(
    path.resolve(process.cwd(), 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

// colorize console
console.log(`
Your kraft App is ready to go!
now run:
npm i express react-dom@18.2.0
`);
