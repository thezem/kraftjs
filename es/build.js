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
kills(null, () => {
  fs.rmdirSync(process.cwd() + '/public/dist', { recursive: true });

  dirFile('public', 'dist').forEach((x) => {
    try {
      delFile('public', 'dist', x);
    } catch (error) {}
  });
  dirFile('public', 'server').forEach((x) => {
    try {
      delFile('public', 'server', x);
    } catch (error) {}
  });
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
let names = dirFile('src', 'pages')
  .map((x, i) => './src/pages/' + x)
  .concat(dirFile('src').map((x) => './src/' + x));
console.log(names);

const conf = require('./conf.js');

//

//

let BmsPlug = {
  name: 'BmsPlug',
  setup(build) {
    build.onStart(() => {
      console.log('build started');
    });
    build.onEnd((result) => {
      console.log(`build ended with ${result.errors.length} errors`);
    });
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
names = names.filter((x) => x !== './src/server.js' && !x.includes('css'));

let result = require('esbuild')
  .build({
    entryPoints: names,
    chunkNames: 'chunks/[name][hash][ext]',
    keepNames: true,
    target: 'es2015',
    sourcemap: false,
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
    external: [
      'react',
      'react-dom',
      'react-router-dom',
      'kraft',
      'kraft/router',
    ],
    platform: 'node',
    watch: false,
    minify: true,
  })
  .then((result) => {
    // read public/index.html

    try {
      const index = fs.readFileSync(
        path.join(__dirname, '../', 'public', 'index.html'),
        'utf8'
      );
      let newIndex = index;
      for (var key in userConf.define) {
        console.log(key);
        newIndex = changeIn(newIndex, key, userConf.define[key]);
      }

      // save to public/dist/index.html
      fs.writeFileSync(
        path.join(__dirname, '../', 'public', 'dist', 'index.html'),
        newIndex
      );
      console.log('build finished...');
    } catch (error) {}
  });

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});
process.on('uncaughtException', (err) => {
  console.log('uncaughtException', err);
});
