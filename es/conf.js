function GenId() {
  // IQCTNsLUXC
  let id =
    Math.random().toString(36).substring(2, 7) +
    Math.random().toString(36).substring(2, 7);
  return id.toUpperCase();
}
const path = require('path');
module.exports = {
  define: {
    _CACHEDATE_: `ca${GenId()}`,
    ahhahah: '999',
    'process.env.NODE_ENV': `"production"`,
  },
  alias: {
    '@pages': path.resolve('./src/pages'),
    '@router': path.resolve('./src/router.jsx'),
  },
};
