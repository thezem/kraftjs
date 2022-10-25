// @ts-nocheck

const { createServer, request } = require('http');
const alias = require('esbuild-plugin-alias');

const { spawn } = require('child_process');
const liveServer = require('live-server');

const esbuild = require('esbuild');
const clients = [];
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
kills(null, () => {
  fs.rmdirSync(process.cwd() + '/public/dist', { recursive: true });
});
const dirFile = (...args) => {
  return kills([], () => {
    return fs.readdirSync(path.resolve(process.cwd(), ...args));
  });
};
let names = dirFile('src', 'pages')
  .map((x, i) => './src/pages/' + x)
  .concat(dirFile('src').map((x) => './src/' + x));

// delete './src/server.js' and './src/index.tsx' from names

names = names.filter((x) => x !== './src/server.js' && !x.includes('css'));

console.log(names);

const changeIn = (str, oldStr, newStr) => {
  return str.split(oldStr).join(newStr);
};

let BmsPlug = {
  name: 'BmsPlug',
  setup(build) {
    build.onStart(() => {
      console.log('build started');
    });
    build.onEnd((result) => {
      console.log(`build ended with ${result.errors.length} errors`);
    });
    const options = build.initialOptions;
    options.define = userConf.define;
    build.onLoad({ filter: /\.js*|.ts*/ }, async (args) => {
      let envs = require('@babel/preset-env');
      let react = require('@babel/preset-react');
      if (
        args.path.includes('css') ||
        args.path.includes('node_modules') ||
        args.path.includes('json')
      )
        return;
      let text = await fs.promises.readFile(args.path, 'utf8');
      let newIndex = text;
      for (var key in userConf.define) {
        newIndex = changeIn(newIndex, key, userConf.define[key]);
      }

      //   search for resolve('*') and replace it with content of the file
      const regex = /resolveFile\((.*?)\)/g;
      let found = newIndex.match(regex);
      if (found) {
        try {
          found = found[0];
          replaced = found.replace('resolveFile', 'fs.readFileSync');
          content = eval(replaced);
          newIndex = newIndex.replace(found, '`' + content + '`');
          newIndex = newIndex.replace('||=', '||');
          newIndex = await require('@babel/core').transformAsync(newIndex, {
            presets: [envs, react],
          });
        } catch (error) {}
      }
      return {
        contents: newIndex.code,
        loader: 'jsx',
      };
    });
  },
};
const resolve = (...args) => {
  return kills(false, () => {
    return path.resolve(process.cwd(), ...args);
  });
};

let result = require('esbuild')
  .build({
    entryPoints: names,
    chunkNames: 'chunks/[name][hash][ext]',
    keepNames: true,
    target: 'es2015',
    sourcemap: 'inline',
    splitting: true,

    allowOverwrite: true,
    outdir: 'public/dist',
    loader: { '.js': 'jsx' },

    plugins: [
      alias({
        '@pages': path.resolve('./src/pages'),
        '@router': path.resolve('./src/router.jsx'),
      }),
      BmsPlug,
    ],
    bundle: true,
    format: 'esm',
    platform: 'node',
    watch: true,
    minify: true,
  })
  .then((result) => {
    // read public/index.html

    const index = fs.readFileSync(resolve('public', 'index.html'), 'utf8');
    let newIndex = index;
    for (var key in userConf.define) {
      console.log(key);
      newIndex = changeIn(newIndex, key, userConf.define[key]);
    }

    // save to public/dist/index.html
    fs.writeFileSync(resolve('public', 'dist', 'index.html'), newIndex);
    console.log('watching...');
  });

// server = require('esbuild')
//   .serve(
//     {
//       servedir: 'public','dist',
//     },
//     {
//       entryPoints: ['src/app.tsx'],

//       sourcemap: 'external',
//       outdir: 'public','dist',
//       bundle: true,
//       minify: false,
//     }
//   )
//   .then((result) => {
//     console.log('watching...', result);
//   });

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
