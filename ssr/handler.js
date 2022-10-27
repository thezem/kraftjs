import React from '../';
import ReactDOMServer from 'react-dom/server';
const userConf = require('../es/conf.js');
import RouterForServer from '../server/index';

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
export async function KraftExpressServer(req, res, next, App, imports) {
  let clientReadyComponents = Object.keys(imports).map((x) => {
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
  let els = [];
  let headString = '';
  await new Promise((resolve) => {
    try {
      KidToArr(KraftApp.props.children).forEach(async (el, i) => {
        if (el.type.name == 'Head') {
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

        if (i == KidToArr(KraftApp.props.children).length - 1) resolve();
      });
    } catch (error) {
      res.status(500).send('Internal Server Error');
      resolve();
    }
  });

  const dataReturn = Defines(html)
    .replace(
      '<head>',
      `<head><script> window.kraftServer = true; 
        window.kraftClientReadyComponents = ${JSON.stringify(
          clientReadyComponents
        )};
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
  res.send(dataReturn);
  return;
}
