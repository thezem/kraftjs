const alias = require('esbuild-plugin-alias');

const esbuild = require('esbuild');
const path = require('path');
const exec = require('child_process').exec;
const nodemon = require('nodemon');
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

console.log(names);
names = names.filter((x) => {
  // not css and not directory
  return !x.includes('.css')
});
clientNames = names.filter((x) => {
  // not css and not directory
  return (
    !x.includes('.css') &&
    !x.includes('./src/server.js')
  );
});
const { Decors, BmsPlug, minify } = require('./blugins');

const buildServerFile =()=>{
 return require('esbuild')
  .build({
    entryPoints: ['./src/server.js'],
    chunkNames: 'chunks/[name][hash][ext]',
    splitting: false,

    keepNames: true,
    // sourcemap: false,
    sourcemap: false,
    define: userConf.define,
    logLevel: 'error',

    splitting: false,

    allowOverwrite: true,
    outfile: 'public/server/server.js',
    loader: { '.js': 'jsx' },

    plugins: [BmsPlug, Decors],

    bundle: true,
    external: ['express'],
    platform: 'node',
    format: 'cjs',

    watch: false,
    minify: false,
  })
}
esbuild
  .build({
    entryPoints: clientNames,
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
    watch: true,
    minify: true,
  })
  .then((res) => {
    buildServerFile().then(async (result) => {
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

        let vercel = {
          version: 2,
          builds: [
            {
              src: '/server.js',
              use: '@vercel/node',
            },
            { src: '/static/**', use: '@vercel/static' },
          ],

          rewrites: [
            {
              source: '/static/:path*',
              destination: '/static/:path*',
            },

            { source: '/(.*)', destination: '/server.js' },
          ],
        };

        await fs.promises.writeFile(
          path.join(process.cwd(), 'public', 'server', 'package.json'),
          JSON.stringify(package, null, 2)
        );
        await fs.promises.writeFile(
          path.join(process.cwd(), 'public', 'server', 'vercel.json'),
          JSON.stringify(vercel, null, 2)
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
      }).then(()=>{
        fs.watch(resolve('src','server.js'),()=>{
          console.log('server.js changed');
          buildServerFile()
        })
        fs.watch(resolve('src','pages'),()=>{
          console.log('server.js changed');
          buildServerFile()
        })
        // exec('nodemon public/server', (err, stdout, stderr) => {
        //   if (err) {
        //     console.error(err);
        //     return;
        //   }
        //   console.log(stdout,'stdout');
        // })
        nodemon({
          script: resolve('public','server','server.js'),
          watch: resolve('public','server','server.js'),
          ext: 'js',
          stdout: false
      })
      .on('readable', function() {
        this.stdout.on('data', function(chunk) {
          console.log(chunk.toString('utf8'));
        });
        this.stderr.on('data', function(chunk) {
          console.error(chunk.toString('utf8'));
        });
      })

  })
  })

