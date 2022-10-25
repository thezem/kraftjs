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
console.log(names);

let BmsPlugFn = async (text) => {
  let envs = require('@babel/preset-env');
  let react = require('@babel/preset-react');

  let newIndex = text;
  for (var key in userConf.define) {
    newIndex = changeIn(newIndex, key, userConf.define[key]);
  }

  //   search for resolve('*') and replace it with content of the file
  const regex = /resolveFile\((.*?)\)/g;

  // searcg for : @run kraft
  const regex2 = /\/\/#@run (.*?)\n/g;
  let found = newIndex.match(regex2) || newIndex.match(regex);
  if (found) {
    try {
      found = found[0];
      replaced = found.replace('resolveFile', 'fs.readFileSync');
      content = eval(replaced);
      newIndex = newIndex.replace(found, '`' + content + '`');
      newIndex = newIndex.replace('||=', '||');
      for (var key in userConf.define) {
        newIndex = changeIn(newIndex, key, userConf.define[key]);
      }
      newIndex = await require('@babel/core').transformAsync(newIndex, {
        presets: [envs, react],
      });
    } catch (error) {}
  }
  return {
    contents: newIndex.code,
    loader: 'jsx',
  };
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

      // searcg for : @run kraft
      const regex2 = /\/\/#@run (.*?)\n/g;

      let found = newIndex.match(regex2) || newIndex.match(regex);
      if (found) {
        try {
          found = found[0];
          replaced = found.replace('resolveFile', 'fs.readFileSync');
          for (var key in userConf.define) {
            newIndex = changeIn(newIndex, key, userConf.define[key]);
          }
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
let Decors = {
  name: 'Decors',
  setup(build) {
    build.onLoad({ filter: /\.js*|.ts*/g }, async (args) => {
      let text = await fs.promises.readFile(args.path, 'utf8');

      // find ://@iterate import for in './pages'
      const regex = /\/\/@iterate import for in \'[a-zA-Z0-9\/]*\'/g;
      let found = text.match(regex);
      if (found) {
        found = found[0];
        folder = found.split("'")[1];
        files = fs.readdirSync(path.join(process.cwd(), 'src', folder));
        str = `let importsX = [${files.map(
          (x) => `import ${x.split('.')[0]} from './${folder}/${x}'`
        )}]
        `;

        str = `let importsX = {${files.map(
          (x) => `'./${folder}/${x}':import('./${folder}/${x}')`
        )}}


        console.log(importsX)`;

        text = text.replace(found, str).replace('||=', '||');
        return {
          contents: text,
          loader: 'jsx',
        };
      }
      // delete all comments from the file
      const regex2 = /\/\/.*\n/g;
      let found2 = text.match(regex2);
      if (found2) {
        found2.forEach((x) => {
          text = text.replace(x, '');
        });
      }

      return BmsPlugFn(text);
      return {
        contents: text,
        loader: 'jsx',
      };
    });
  },
};

let Defines = {
  name: 'Defines',
  setup(build) {
    build.onLoad({ filter: /.*\.js*|.ts*|.html|.css|$/g }, async (args) => {
      let text = await fs.promises.readFile(args.path, 'utf8');
      for (var key in userConf.define) {
        text = changeIn(text, key, userConf.define[key]);
      }
      loader = (() => {
        return args.path.includes('.js') ? 'jsx' : args.path.split('.')[1];
      })();

      return {
        contents: text,
        loader: loader,
      };
    });
  },
};

let result = require('esbuild')
  .build({
    entryPoints: names,
    chunkNames: 'chunks/[hash][ext]',
    keepNames: true,
    sourcemap: 'inline',
    splitting: true,
    allowOverwrite: true,
    outdir: 'public/server',
    loader: { '.js': 'jsx' },

    plugins: [
      Decors,
      alias({
        '@pages': path.resolve('./src/pages'),
        '@router': path.resolve('./src/router.jsx'),
      }),
      BmsPlug,
      Defines,
      Decors,
    ],
    bundle: true,
    platform: 'node',
    format: 'esm',

    watch: false,
    minify: true,
  })
  .then(() => {
    require('esbuild')
      .build({
        entryPoints: ['./src/server.js'],
        chunkNames: 'chunks/[name][hash][ext]',
        keepNames: true,
        // sourcemap: false,
        sourcemap: 'inline',

        splitting: false,

        allowOverwrite: true,
        outfile: 'public/server/server.js',
        loader: { '.js': 'jsx' },

        plugins: [
          Decors,
          alias({
            '@pages': path.resolve('./src/pages'),
            '@router': path.resolve('./src/router.jsx'),
          }),
          Decors,
          Decors,
        ],

        bundle: true,
        platform: 'node',
        format: 'cjs',

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
            '@babel/preset-env': '^7.19.4',
            '@babel/preset-react': '^7.18.6',
            esbuild: '^0.15.11',
            express: '^4.18.2',
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            kraftjs: '',
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
          console.log(key);
          newIndex = changeIn(newIndex, key, userConf.define[key]);
        }

        // save to public/dist/index.html
        fs.writeFileSync(resolve('public', 'dist', 'index.html'), newIndex);
        console.log('watching...');
        console.log('build finished...');
        try {
          require(process.cwd() + '/public/server/server.js');
        } catch (error) {
          console.log(error);
        }
      });
  });
