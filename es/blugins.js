const path = require('path');
const fs = require('fs');
const userConf = require('./conf.js');
const changeIn = (str, oldStr, newStr) => {
  return str.split(oldStr).join(newStr);
};
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

let handleStr = (saidPath, folder, x) => {
  return `${path.relative(
    saidPath,
    path.join(process.cwd(), 'src', folder, x)
  )}`
    .replace('.', '')
    .split('\\')
    .join('/');
};
function CustomSyntax(found, text, saidPath) {
  found = found[0];
  folder = found.split("'")[1];
  console.log(folder, __dirname);
  files = fs.readdirSync(path.join(process.cwd(), 'src', folder));
  str = `let importsX = [${files.map(
    (x) => `import ${x.split('.')[0]} from './${folder}/${x}'`
  )}]
          `;

  str = `let importsX = {${files.map(
    (x) => `'./${folder}/${x}':import('./${folder}/${x}')`
  )}}`;
  str = `let importsX = {${files.map(
    (x) =>
      `'./${folder}/${x}':
        
        import('${handleStr(saidPath, folder, x)}')`
  )}}`;
  // console.log(str);
  text = text.replace(found, str).replace('||=', '||');
  //#
  const regex2 = /resolveFile/g;

  let found2 = text.match(regex2);
  if (found2) {
    try {
      found = found2[0];
      let html = fs.readFileSync(
        path.resolve(process.cwd(), 'public', 'index.html')
      );
      replaced = found.replace('resolveFile', `${html}`);
      text = text.replace(found, '`' + replaced + '`');
    } catch (error) {
      console.log(error);
    }
  }
  //#

  return {
    contents: text,
    loader: 'jsx',
  };
}
let Decors = {
  name: 'Decors',
  setup(build) {
    build.onLoad({ filter: /\.js*|.ts*/g }, async (args) => {
      let text = await fs.promises.readFile(args.path, 'utf8');

      // find ://@iterate import for in './pages'
      const regex = /\/\/@iterate import for in \'[a-zA-Z0-9\/\.]*\'/g;
      // const regex = /\/\/@iterate import for in \'[a-zA-Z0-9\/]*\'/g;
      let found = text.match(regex);
      if (found) {
        console.log(args.path);
        return CustomSyntax(found, text, args.path);
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

module.exports = {
  BmsPlugFn,
  BmsPlug,
  handleStr,
  CustomSyntax,
  Decors,
  Defines,
};
