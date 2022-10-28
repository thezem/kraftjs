const alias = require('esbuild-plugin-alias');

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
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
dirFile('public', 'server', 'chunks').forEach((x) => {
  kills(null, () => {
    delFile('public', 'server', 'chunks', x);
  });
});

kills(null, () => {
  fs.rmdirSync(process.cwd() + '/public/server/chunks', { recursive: true });
  fs.rmdirSync(process.cwd() + '/public/server/', { recursive: true });

  dirFile('public', 'server').forEach((x) => {
    if (x.includes('-ks-')) {
      console.log(x);
      delFile('public', 'server', x);
    }
  });
  dirFile('public', 'server', 'pages').forEach((x) => {
    if (x.includes('-ks-')) {
      console.log(x);
      delFile('public', 'server', 'pages', x);
    }
  });
});

let names = dirFile('src', 'pages')
  .map((x, i) => './src/pages/' + x)
  .concat(dirFile('src').map((x) => './src/' + x));

names = names.filter((x) => {
  // not css and not directory
  return !x.includes('.css') && fs.statSync(x).isFile();
});
const { Decors, BmsPlug, minify } = require('./blugins');
console.log(names);

esbuild
  .build({
    entryPoints: names,
    chunkNames: 'chunks/[hash][ext]',
    splitting: true,
    keepNames: true,
    sourcemap: 'external',
    allowOverwrite: true,
    outdir: 'public/server/static',
    loader: { '.js': 'jsx' },
    external: ['express'],
    define: userConf.define,
    logLevel: 'info',
    plugins: [Decors, minify],
    bundle: true,
    platform: 'node',
    format: 'esm',
    watch: false,
    minify: true,
  })
  .then((res) => {
    require('esbuild')
      .build({
        entryPoints: ['./src/server.js'],
        chunkNames: 'chunks/[name][hash][ext]',
        splitting: false,

        keepNames: true,
        // sourcemap: false,
        sourcemap: false,
        define: userConf.define,
        logLevel: 'info',

        splitting: false,

        allowOverwrite: true,
        outfile: 'public/server/server.js',
        loader: { '.js': 'jsx' },

        plugins: [BmsPlug, Decors],

        bundle: true,
        external: ['express'],
        platform: 'node',
        format: 'iife',

        watch: false,
        minify: true,
      })
      .then(async (result) => {
        // /write package.json for server
        let package = {
          name: 'kraftserver',
          version: '1.0.0',
          main: 'server.js',
          scripts: {
            test: 'echo "Error: no test specified" && exit 1',
            start: 'node server.js',
          },
          keywords: [],
          author: '',
          license: 'ISC',
          dependencies: {
            express: '^4.18.2',
            'react-dom': '^18.2.0',
            kraftjs: 'git+https://github.com/antiihope/kraftjs.git',
          },
          devDependencies: {},
          description: '',
        };
        await fs.promises.writeFile(
          path.join(process.cwd(), 'public', 'server', 'package.json'),
          JSON.stringify(package, null, 2)
        );

        const index = fs.readFileSync(resolve('public', 'index.html'), 'utf8');
        let newIndex = index;
        for (var key in userConf.define) {
          // console.log(key);
          newIndex = changeIn(newIndex, key, userConf.define[key]);
        }

        // save to public/server/index.html
        fs.writeFileSync(resolve('public', 'server', 'index.html'), newIndex);
        console.log('build finished...');
      });
  });
