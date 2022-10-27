function GenId() {
  // every build has it's own cache key , so we can use it to invalidate the cache on new builds
  // thils will be used by the router to prevent old builds from loading the wrong page
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

if (process.argv.includes('--prod') || process.argv.includes('prod')) {
  provenv = 'prod';
}
if (kr[provenv]) {
  kr = kr[provenv];
}
for (var key in kr.define) {
  kr.define[key] = JSON.stringify(kr.define[key]);
}
let ex = {
  define: {
    ...kr.define,
    _CACHEDATE_: JSON.stringify(`kr${GenId()}`),
    'process.env.NODE_ENV': `"production"`,
  },
};
console.log(ex);
module.exports = ex;
