function GenId() {
  // IQCTNsLUXC
  let id = Math.random().toString(36).substring(2, 9);
  return id.toUpperCase();
}
const path = require('path');
const fs = require('fs');
let kr = {};
let provenv = 'dev';
// see if kr.json exists
if (fs.existsSync(path.resolve(process.cwd(), 'kr.js'))) {
  kr = require(path.resolve(process.cwd(), 'kr.js'));
}

if (process.argv.includes('prod') || process.argv.includes('--prod')) {
  provenv = 'prod';
}
if (kr[provenv]) {
  kr = kr[provenv];
}
for (var key in kr.define) {
  kr.define[key] = JSON.stringify(kr.define[key]);
}
console.log(kr);
module.exports = {
  define: {
    _CACHEDATE_: `kr${GenId()}`,
    'process.env.NODE_ENV': `"production"`,
  },
  ...kr,
};
