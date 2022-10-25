// //@ts-nocheck
import React from '../';

import ReactDOMServer from 'react-dom/server';
import fs from 'fs';
let html = fs.readFileSync('./public/index.html', 'utf8');
import express from 'express';
import RouterForServer from '../server/index';
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
  await new Promise((resolve) => {
    KraftApp.props.children.forEach(async (el, i) => {
      if (el.type.name == 'RouterServer') {
        els.push(await RouterForServer(el.props.children, imports));
      } else {
        els.push({ Comp: el.type, props: el.props });
      }
      if (i == KraftApp.props.children.length - 1) resolve();
    });
  });
  const dataReturn = html.replace(
    '<div id="root"></div>',
    `<div id="root">${ReactDOMServer.renderToString(
      <React.Suspense fallback={<div>loading...</div>}>
        {els.map((El, i) => {
          return <El.Comp {...El.props} key={i} />;
        })}
      </React.Suspense>
    )}</div>`
  );
  print(req.path);
  res.send(dataReturn);
  next();
  return;
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
    Must(options.imports, 'object', 'imports');
    this.options = options;
    return () => {
      return this.start(options);
    };
  }
  start(options) {
    const app = express();

    app.start = app.listen;
    app.listen = (...args) => {
      app.use('/', express.static('public/server'));
      app.use('/pages', express.static('public/server/pages'));
      app.use('/', async (req, res, next) => {
        await KraftExpressServer(req, res, next, options.App, options.imports);
      });

      return app.start(...args);
    };
    return app;
  }
}

export default KraftServer;
