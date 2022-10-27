// //@ts-nocheck
import React from '../';
import ReactDOMServer from 'react-dom/server';
import fs from 'fs';
import path from 'path';
const file = path.resolve(process.cwd(), 'public/server', 'index.html');

let html = resolveFile;
import express from 'express';
import RouterForServer from '../server/index';
import { ESRCH } from 'constants';
let toArr = (kids) => {
  if (Array.isArray(kids)) {
    return kids;
  }
  if (kids) {
    return [kids];
  }
};

//@iterate import for in 'pages'
// console.log(importsX);
async function KraftExpressServer(req, res, next, App, imports) {
  var print = console.log;
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
  let KraftApp = App();
  let els = [];
  let headString = '';
  await new Promise((resolve) => {
    try {
      toArr(KraftApp.props.children).forEach(async (el, i) => {
        if (el.type.name == 'Head') {
          // console.log('head');

          let head = await ReactDOMServer.renderToString(el);

          headString = head.replace('<head>', '').replace('</head>', '');
          return;
        }
        if (el.type.name == 'RouterServer') {
          let C = await RouterForServer(el.props.children, imports);
          if (C.Comp.name == 'Error' || C.Comp.name == 'NotFound') {
            res.status(400);
          }
          els.push(C);
        } else {
          els.push({ Comp: el.type, props: el.props });
        }
        res.setHeader('Cache-Control', 'max-age=360');

        if (i == toArr(KraftApp.props.children).length - 1) resolve();
      });
    } catch (error) {
      res.status(500).send('Internal Server Error');
      resolve();
    }
  });
  const dataReturn = html
    .replace(
      '<head>',
      `<head><script>
  window.kraftServer = true;
  </script>${headString}`
    )
    .replace(
      '<div id="root"></div>',
      `<div id="root">${ReactDOMServer.renderToString(
        <React.Suspense fallback={<div>loading...</div>}>
          {els.map((El, i) => {
            return <El.Comp {...El.props} key={i} />;
          })}
        </React.Suspense>
      )}</div>
    `
    );

  print(req.path);
  res.send(dataReturn);
  return;
}
function NotPage(FilePath) {
  return (
    FilePath.endsWith('js') ||
    FilePath.endsWith('css') ||
    FilePath.endsWith('txt')
  );
}

function Must(x, y, z) {
  if (typeof x !== y) {
    throw new Error(`Type of ${z} Must be ${y}`);
  }
}
class KraftServer {
  constructor(options) {
    Must(options, 'object', 'KraftServer');
    Must(options.App, 'function', 'App');
    // Must(options.imports, 'object', 'imports');
    this.options = options;
    return () => {
      return this.start(options);
    };
  }
  start(options) {
    const app = express();

    app.start = app.listen;
    app.listen = (...args) => {
      app.use((req, res, next) => {
        if (NotPage(req.path)) {
          res.setHeader('Cache-Control', 'public, max-age=360000');
        }
        res.setHeader('Access-Control-Max-Age', '600');
        res.setHeader('x-powered-by', 'Kraftjs');
        next();
      });

      app.get('/', async (req, res, next) => {
        await KraftExpressServer(req, res, next, options.App, importsX);
      });
      app.use('/pages', express.static('public/server/pages'));
      app.use('/', express.static('public/server'));
      app.use('/', async (req, res, next) => {
        await KraftExpressServer(req, res, next, options.App, importsX);
      });
      return app.start(...args);
    };
    return app;
  }
}

export default KraftServer;
