// //@ts-nocheck
import express from 'express';
import morgan from 'morgan';
import { KraftExpressServer } from './handler';
//@iterate import for in 'pages'

function Must(x, y, z) {
  if (typeof x !== y) {
    throw new Error(`Type of ${z} Must be ${y}`);
  }
}
function NotPage(FilePath) {
  return (
    FilePath.endsWith('js') ||
    FilePath.endsWith('css') ||
    FilePath.endsWith('txt')
  );
}

class KraftServer {
  constructor(options) {
    Must(options, 'object', 'KraftServer');
    Must(options.App, 'function', 'App');
    this.options = options;
    return () => {
      return this.start(options);
    };
  }
  start(options) {
    const app = express();
    // app.use(morgan('tiny'));

    app.start = app.listen;
    app.listen = (...args) => {
      app.use((req, res, next) => {
        if (NotPage(req.path)) {
          if (process.env.NODE_ENV === 'production') {
            console.log(process.env.NODE_ENV);
            res.setHeader('Cache-Control', 'public, max-age=360000');
          }
        }
        res.setHeader('Access-Control-Max-Age', '600');
        res.setHeader('x-powered-by', 'Kraft-Express-js');
        next();
      });

      app.get('/', async (req, res, next) => {
        await KraftExpressServer(req, res, next, options.App, importsX);
      });
      app.use('/static', express.static('public/server/static'));
      app.use('/static', express.static('./static'));
      app.use('/', express.static('public/server'));
      app.use('/', async (req, res, next) => {
        return await KraftExpressServer(req, res, next, options.App, importsX);
      });
      return app.start(...args);
    };
    return app;
  }
}

export default KraftServer;
