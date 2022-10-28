const alias = require('esbuild-plugin-alias');

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const liveServer = require('live-server');
const userConf = require('./conf.js');
function kills(x, ca) {
  try {
    return ca();
  } catch (error) {
    return x;
  }
}
const resolve = (...args) => {
  return kills(false, () => {
    return path.resolve(process.cwd(), ...args);
  });
};

const dirFile = (...args) => {
  return kills([], () => {
    return fs.readdirSync(path.resolve(process.cwd(), ...args));
  });
};
const delFile = (...args) => {
  return fs.unlinkSync(path.join(__dirname, '../', ...args));
};

const changeIn = (str, oldStr, newStr) => {
  return str.split(oldStr).join(newStr);
};
dirFile('public', 'dist', 'chunks').forEach((x) => {
  kills(null, () => {
    delFile('public', 'dist', 'chunks', x);
  });
});

kills(null, () => {
  fs.rmdirSync(process.cwd() + '/public/dist/chunks', { recursive: true });
  fs.rmdirSync(process.cwd() + '/public/dist/', { recursive: true });

  dirFile('public', 'dist').forEach((x) => {
    if (x.includes('-ks-')) {
      console.log(x);
      delFile('public', 'dist', x);
    }
  });
  dirFile('public', 'dist', 'pages').forEach((x) => {
    if (x.includes('-ks-')) {
      console.log(x);
      delFile('public', 'dist', 'pages', x);
    }
  });
});

const names = dirFile('src', 'pages')
  .map((x, i) => './src/pages/' + x)
  .concat(dirFile('src').map((x) => './src/' + x));

const { Decors, minify } = require('./blugins');

esbuild
  .build({
    entryPoints: names,
    chunkNames: 'chunks/[name][ext]',
    splitting: true,
    keepNames: true,
    sourcemap: 'external',
    allowOverwrite: true,
    outdir: 'public/dist/static',
    loader: { '.js': 'jsx' },
    external: ['express'],
    define: userConf.define,
    logLevel: 'info',
    plugins: [Decors, minify],
    bundle: true,
    platform: 'node',
    format: 'esm',
    watch: true,
    minify: true,
  })
  .then(() => {
    // read public/index.html

    const index = fs.readFileSync(resolve('public', 'index.html'), 'utf8');
    let newIndex = index;
    for (var key in userConf.define) {
      console.log(key);
      newIndex = changeIn(newIndex, key, userConf.define[key]);
    }

    // save to public/dist/index.html
    fs.writeFileSync(resolve('public', 'dist', 'index.html'), newIndex);

    let consc = {
      open: false,
      port: process.argv[4] || 3000,
      root: './public/dist',
      file: 'index.html',
    };
    liveServer.start(consc);

    setTimeout(() => {
      console.log(
        'server started at http://localhost:' + (process.argv[4] || 3000)
      );
    }, 1500);

    console.log('watching...');
  });
