const { build } = require('esbuild');
const fs = require('fs-extra');
const path = require('path');
const generateBuild = async () => {
  await fs.rmdirSync('./build/static', { recursive: true });
  const names = fs
    .readdirSync(path.join(__dirname, '../', 'src', 'pages'))

    .map((x, i) => './src/pages/' + x)
    .concat(
      fs
        .readdirSync(path.join(__dirname, '../', 'src'))
        .map((x) => './src/' + x)
    );
  names.unshift('./src/server.js');
  names.unshift('./src/index.tsx');
  await build({
    entryPoints: names,
    outdir: './build/static/js',
    minify: false,
    splitting: true,
    bundle: true,
    format: 'esm',
    platform: 'node',
    sourcemap: false,
    target: ['es2015'],
    loader: { '.svg': 'dataurl', '.png': 'dataurl', '.js': 'jsx' },
    define: {
      'process.env.NODE_ENV': "'production'",
    },
  }).catch(() => process.exit(1));
  await fs.move(
    './build/static/js/index.css',
    './build/static/css/index.css',
    (err) => {
      if (err) return console.error(err);
      console.log('success!');
      return null;
    }
  );
};
generateBuild();
