import React from '../';
import { renderToString, renderToPipeableStream } from 'react-dom/server';
const userConf = require('../es/conf.js');
import RouterForServer from '../server/index';
const { Writable } = require('stream');
const Caches = {};

const html = resolveFile;
let Defines = (x) => {
  const changeIn = (str, oldStr, newStr) => {
    return str.split(oldStr).join(newStr);
  };
  for (var key in userConf.define) {
    x = changeIn(x, key, userConf.define[key]);
  }
  return x;
};
let KidToArr = (kids) => {
  return React.Children.toArray(kids);
};
//@iterate import for in 'pages'
let hashString = (str) => {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

async function findHead(KraftApp) {
  return await new Promise((resolve) => {
    try {
      KidToArr(KraftApp.props.children).forEach((el, i) => {
        if (el.type.name == 'Head') {
          let head = renderToString(el);
          let headString = head.replace('<head>', '').replace('</head>', '');
          return resolve(headString);
        }
        if (i == KidToArr(KraftApp.props.children).length - 1) {
          return resolve(' ');
        }
      });
    } catch (e) {
      resolve(' ');
    }
  });
}
const setToCache = (key, value) => {
  Caches[key] = value;
};
const isInCache = (key) => {
  if (!Caches[key]) return false;
  return Caches[key];
};
export async function KraftExpressServer(req, res, next, App, imports) {
  if (req.path?.includes('.js')) {
    return next();
  }
  if (isInCache(req.url)) {
    return res.send(isInCache(req.url));
  }
  let clientReadyComponents = Object.keys(imports).map((x) => {
    /// kraft sends the pages names hash of the App to the client side
    // kraft router compares the hashes before requesting the javascript to see if it exists
    return hashString(x);
  });
  global.location = {
    ancestorOrigins: {},
    href: req.protocol + '://' + req.headers.host + req.url,
    origin: req.headers.host,
    protocol: req.protocol,
    host: req.headers.host,
    hostname: req.headers.host,
    port: '',
    pathname: req.url,
    search: '',
    hash: '',
  };
  global.window = global.window || {};
  global.sessionStorage = global.sessionStorage || {};
  global.localStorage = global.localStorage || {};
  global.AppLocals = global.AppLocals || {};
  const KraftApp = App();

  let headString = await findHead(KraftApp);
  const dataReturn = Defines(html).replace(
    '<head>',
    `<head><script> window.kraftServer = true; 
        window.kraftClientReadyComponents = ${JSON.stringify(
          clientReadyComponents
        )};
        </script>${headString}`
  );
  let HeadBodyHtml = dataReturn.split('</head>');
  res.setHeader('Cache-Control', 'max-age=360');
  res.setHeader('Content-Type', 'text/html');
  let returnString = HeadBodyHtml[0] + '</head><body><div id="root">';

  const pipeAndSend = (res, Component) => {
    return new Promise(async (resolve) => {
      const stream = await renderToPipeableStream(await Component, {
        onAllReady: async () => {
          stream.pipe(
            new Writable({
              write(chunk, encoding, callback) {
                returnString += chunk.toString();
                callback();
              },
              final(callback) {
                setTimeout(() => {}, 500);
                callback();
              },
            }),
            { end: false }
          );
          resolve();
        },
      });
    });
  };

  await new Promise((resolve) => {
    try {
      KidToArr(KraftApp.props.children).forEach(async (el, i) => {
        switch (el.type.name) {
          case 'Head':
            return;
          case 'head':
            return;
          case 'RouterServer':
            let C = await RouterForServer(el.props.children, imports);
            await pipeAndSend(res, <C.Comp {...C.props} />);
            break;
          default:
            await pipeAndSend(res, <el.type {...el.props} key={i} />);
            break;
        }
        if (i == KidToArr(KraftApp.props.children).length - 1) resolve();
      });
    } catch (error) {
      console.log(error);
      pipeAndSend(res, <KraftApp />);
      resolve();
    }
  });
  returnString += '</body>' + HeadBodyHtml[1].split('</body>')[1];
  setToCache(req.url, returnString);
  res.end(returnString);
  return;
}
