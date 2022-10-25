import React, { useState, useEffect, Suspense } from '../index.js';

const GLOBAL_CACHE = 'cache-v2';

var window = globalThis || {};
let sessionStorage = window.sessionStorage || {};
var localStorage = window.localStorage || {};
let AppLocals = AppLocals || {};

globalThis.ThisStorage = new Proxy(
  { ...sessionStorage },
  {
    get(target, name) {
      // console.log(target, name);
      let exist = sessionStorage[name];
      if (exist) {
        try {
          return JSON.parse(exist);
        } catch (error) {
          return exist;
        }
      }
      return undefined;
    },
    set(target, name, value) {
      sessionStorage[name] = JSON.stringify(value);
      return true;
    },
  }
);

AppLocals = globalThis.AppLocals = new Proxy(
  { ...localStorage },
  {
    get(target, name) {
      let exist = localStorage[name];
      if (exist) {
        try {
          return JSON.parse(exist);
        } catch (error) {
          return exist;
        }
      }
      return undefined;
    },
    set(target, name, value) {
      localStorage[name] = JSON.stringify(value);
      return true;
    },
  }
);
window.OriginalFetch = window.fetch;

String.prototype.hashCode = function () {
  var hash = 0;
  for (var i = 0; i < this.length; i++) {
    var char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

var isValid = function (response) {
  if (!response) return false;
  var fetched = response.headers.get('sw-fetched-on');
  if (
    fetched &&
    parseFloat(fetched) + 1000 * 60 * 60 * 1 > new Date().getTime() // 1 hour
  )
    //@ code above in english:
    // if the response was fetched within the last hour then it is valid , otherwise it is not valid and needs to be fetched again
    return true;
  return false;
};

const CachedItems = {};

const GenID = () => {
  //9 character random string
  let r = (Math.random() + 100).toString(36).substring(3);
  // 12 character random string
  r += (Math.random() + 100).toString(36).substring(3);
  return r;
};
if (sessionStorage.MuC_ID === undefined) {
  sessionStorage.MuC_ID = GenID();
}
function Routes() {
  this.routes = {};
  this.Component = {};
  this.nav = {};
  this.GottenComps = {};

  this.setNav = (i) => {
    this.nav = i;
    return this;
  };
  this.SaveComponent = (i, x) => {
    this.GottenComps[i] = x;
    return this;
  };
  this.GetComponent = (i) => {
    if (this.GottenComps.hasOwnProperty(i)) {
      return this.GottenComps;
    }
    return false;
  };

  this.setRoutes = (i) => {
    this.routes = { ...i, ...this.routes };
    return this;
  };
  this.setComponent = (i) => {
    this.Component = i;
    return this;
  };
  return this;
}

var routes = new Routes();
function Error() {
  return (
    <div>
      <h1>404</h1>
      <p>Page not found</p>
    </div>
  );
}

function findParam(str, path = location.pathname) {
  try {
    var regex = new RegExp('/[A-z-0-9-/]+', 'g');
    var Fpath = [];
    try {
      var Fpath = str.match(regex)[0]; //#check later
    } catch (error) {}
    var count = str.split(/\//g);
    var ignore = {};

    var obj = {};
    var c = 0;

    count = count.map((el, i) => {
      if (el.includes('*')) {
        el = el.split('*').join('');

        ignore[count[0]] = i;
      }
      return el;
    });

    for (const el of count) {
      if (count[c + 1]) {
        obj[c] = count[c + 1];
        c++;
      } else break;
    }

    var count = path.split(/\//g);

    var obj2 = {};

    var c = 0;
    for (const el of count) {
      if (count[c + 1]) {
        obj2[c] = count[c + 1];
        c++;
      } else break;
    }

    // ignore key based on * value in Comp path
    for (var key in ignore) {
      var num = ignore[key];
      var c = 0;
      for (var value in obj2) {
        if (c == num) {
          delete obj2[value];
        }
        c++;
      }
    }
    //End ignore key based on * value in Comp path

    // console.log(obj);

    var newobj = {};
    if (Object.keys(obj).length == Object.keys(obj2).length) {
      if (obj[0] == obj2[0]) {
        for (var i in obj) {
          if (obj[i] && obj2[i]) {
            newobj[obj[i].replace(':', '')] = obj2[i];
          } else {
            var newobj = {};
            break;
          }
        }
        newobj['path'] = Fpath;
        delete newobj[obj[0]];
      }
    }
    var returns = {
      path: newobj['path'] ? newobj['path'] : false,
      props: delete newobj['path'] ? newobj : {},
    };
    return returns;
  } catch (error) {
    return { path: str, props: {} };
  }
}

function _ParseProps(obj, path = location.pathname) {
  var list = [];
  for (var key in obj) {
    if (Array.isArray(obj[key])) {
      obj[key].forEach((IX) => {
        var paths = findParam(IX, path);
        if (paths.path !== false) {
          paths.path = key;
          list.push(paths);
        }
      });
    } else {
      var paths = findParam(obj[key], path);
      if (paths.path) {
        paths.path = key;
        list.push(paths);
      }
    }
  }
  list.reverse();
  return list[0] || { path: '404', props: {} };
}

function _routeParser(obj, path = location.pathname) {
  /**
   * Given a dictionary of paths and their corresponding props, find the path that matches the current
   * path and return the props
   *
   * Args:
   *   obj: The object that contains the paths and props for each page.
   *   path: The pathname of the current page.
   *
   * Returns:
   *   The new params object.
   */

  var list = [];
  var passed = {};

  for (var key in obj) {
    passed[key] = obj[key].path;
    // if (obj[key].path == path) {
    //   passed[key] = obj[key].path;
    // }
  }

  var newparams = _ParseProps(passed, path);

  if (passed.hasOwnProperty(newparams.path)) {
    newparams.props = { ...obj[newparams.path].props, ...newparams.props };
  }

  for (var key in obj) {
    if (obj[key].path == path) {
      newparams.props = { ...obj[key].props, ...newparams.props };
    }
  }

  return newparams;
}

async function _ImportComp(x) {
  if (typeof x === 'function') return x;
  var Found = routes.GetComponent(x);
  if (Found) {
    return Found[x];
  }
  try {
    if (window.addEventListener) {
      return await import('/pages/' + x + '.js').then((C) => {
        // console.log(C);
        routes.SaveComponent(x, C);
        return C;
      });
    } else {
      return await import('./pages/' + x + '.js').then((C) => {
        // console.log(C);

        routes.SaveComponent(x, C);
        return C;
      });
    }
  } catch (error) {
    // console.log(x, error);
    // console.log('Cannot find module', x);

    if (error.message.includes('Cannot find module', x)) {
      routes.SaveComponent(x, false);
      // console.log(routes);
      // console.log('Cannot find module', x);
    }
    return false;
  }
}

function External(props) {
  const [hoverd, setHoverd] = useState(false);
  const [className, setclassName] = useState(
    props.className ? props.className : ''
  );
  const [target, settarget] = useState(props.target ? props.target : '_blank');

  useEffect(() => {
    if (props.href == '#') {
      settarget('_self');
    }
    return () => {
      true;
    };
  }, []);

  return (
    <a
      style={{ cursor: 'pointer' }}
      className={className}
      target={target}
      rel="prefetch"
      href={props.href}
    >
      {props.children}
    </a>
  );
}

export function Link(props) {
  try {
    try {
      var regex = new RegExp('(https?://*.*)');
      if (props.href.match(regex)) {
        return <External {...props} />;
      }
    } catch (error) {
      return <External {...props} />;
    }
    const [Component, setComponent] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [className, setclassName] = useState(
      props.className ? props.className : ''
    );

    const [params, setParams] = useState(
      _routeParser(routes.routes, props.href)
    );

    const _DispatchPop = () => {
      props.onClick && props.onClick();

      window.history.pushState({ path: props.href }, '', props.href);
      // window.dispatchEvent(new Event('popstate'));
      window.dispatchEvent(
        new CustomEvent('popstate', {
          detail: props.props,
        })
      );
    };

    return (
      <a
        onMouseOver={() => {
          _ImportComp(params.path);
        }}
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          if (props.href == location.pathname && !props.pass) {
            props.onClick && props.onClick();
            e.preventDefault();
            return;
          }

          _DispatchPop();
          e.preventDefault();
          return false;
        }}
        className={className}
        href={props.href}
      >
        {props.children}
      </a>
    );
  } catch (error) {
    console.log(error);
    return <a href={props.href}>{props.children}</a>;
  }
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function State(event, callback = () => {}) {
  document.body.style.cursor = 'wait';

  var _WaitingCursor = setTimeout(() => {
    document.body.style.cursor = '';
  }, 1000);
  var name;
  var thisPath = location.pathname;
  thisPath == '/' ? (name = 'index') : (name = thisPath.replace(/\//, ''));
  for (const key in routes.routes) {
    if (thisPath == key) {
      name = key;
    }
  }
  var newParams = _routeParser(routes.routes, thisPath);
  let Com = await getComponet(name, newParams.props);
  callback(Com, newParams.props);
  return;
  if (newParams.path == '404') {
    _ImportComp(name).then((comp) => {
      callback(comp, newParams.props);
      clearTimeout(_WaitingCursor);
      document.body.style.cursor = '';
    });
  } else {
    _ImportComp(newParams.path).then((comp) => {
      callback(comp, newParams.props);
      clearTimeout(_WaitingCursor);
      document.body.style.cursor = '';
    });
  }
}

function _ParseCompChildren(obs) {
  /**
   * It takes an object of observables and returns an object of React components.
   *
   * Returns:
   *   A dictionary of the form {'Comp': {'path': 'path', 'props': {'prop': 'prop'}}}.
   */

  const GetProps = (obj) => {
    var ElementProps = {};
    for (const prop in obj.props) {
      if (prop == 'path') {
        continue;
      }
      if (prop == 'Comp') {
        continue;
      }
      ElementProps[prop] = obj.props[prop];
    }

    return ElementProps;
  };

  var obj = {};
  if (Array.isArray(obs)) {
    for (const key in obs) {
      obj[obs[key].props.Comp] = {
        path: obs[key].props.path,
        props: GetProps(obs[key]) || {},
      };
    }
  } else {
    obj[obs.props.Comp] = {
      path: obs.props.path,
      props: GetProps(obs) || {},
    };
  }

  return obj;
}

AppLocals['_reactKeys'] = AppLocals['_reactKeys'] || {};
let valus = Object.keys(AppLocals['_reactKeys']);
let len = Object.keys(AppLocals['_reactKeys']).length;
if (len > 22) {
  console.log('Bigger than');
  let newKeys = AppLocals['_reactKeys'];
  delete newKeys[valus[0]];
  AppLocals['_reactKeys'] = newKeys;
}

window._reactKeys = {};

function useSession(defKey, defaultValue = false) {
  // console.log(_reactKeys[defKey]);

  if (!_reactKeys[defKey]) {
    _reactKeys[defKey] = {};
  }

  let [keyName] = useState(JSON.stringify(defaultValue).hashCode());
  // console.log(keyName);
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const value = window._reactKeys[defKey][keyName];

      if (value) {
        return JSON.parse(value);
      } else {
        window._reactKeys[defKey][keyName] = JSON.stringify(defaultValue);
        // AppLocals['_reactKeys'] = window._reactKeys;

        return defaultValue;
      }
    } catch (err) {
      console.log(err);
      return defaultValue;
    }
  });

  const setValue = (newValue) => {
    try {
      window._reactKeys[defKey][keyName] = JSON.stringify(newValue);
      // AppLocals['_reactKeys'] = _reactKeys;
      setStoredValue(newValue);
    } catch (err) {}
    setStoredValue(newValue);
  };

  return [storedValue, setValue];
}
export const Router = (obs) => {
  const [props, setprops] = useState(_ParseCompChildren(obs.children) || {});

  routes.setRoutes(props);
  const [params, setParams] = useState(_routeParser(props));

  const [Comprops, setComprops] = useState(params.props ? params.props : {});
  for (const key in Comprops) {
    try {
      Comprops[key] = decodeURIComponent(Comprops[key]);
    } catch (error) {
      Comprops[key] = Comprops[key];
    }
  }
  const [Component, setComponent] = useState(false);
  const [fallback, setFallback] = useState(obs.fallback ? obs.fallback : false);
  const [isLoading, setIsLoading] = useState(true);
  const [thisPath, setthisPath] = useState(location.pathname);
  const [onunmount, setonunmount] = useState(() => {});
  // console.log(params);

  useEffect(() => {
    let intv;

    if (window.addEventListener) {
      const setListen = () => {
        window.addEventListener('popstate', async (E) => {
          setIsLoading(true);
          onunmount && onunmount();

          setonunmount(obs.onunmount ? obs.onunmount : () => {});
          State(E, async (x, y) => {
            try {
              // console.log(x, y);
            } catch (error) {
              // console.log(error);
            }

            setComprops({ ...y, ...E.detail });
            setComponent(x);
            setIsLoading(false);
          });
        });
        clearInterval(intv);
      };
      setListen();
    } else {
      intv = setInterval(() => {
        if (window.addEventListener) {
          setListen();
        }
      }, 100);
    }

    thisPath == '/' ? (name = 'index') : (name = thisPath.replace(/\//, ''));
    try {
      _ImportComp(name).then((comp) => {
        if (!comp) {
          _ImportComp(params.path).then((Comp2) => {
            setComponent(Comp2);
            setIsLoading(false);
          });
        } else {
          setComponent(comp);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.log(error);
      setComponent(false);
      setIsLoading(false);
    }

    // predownload all the components
    // for (const key in routes.routes) {
    //   _ImportComp(key);
    // }
    return () => {
      onunmount && onunmount();
    };
  }, []);

  if (isLoading) {
    if (fallback) {
      return fallback;
    }
    return <div> loading..</div>;
  }

  if (Component) {
    let _RouterStore = (value) => {
      let initkey =
        Component.default.toString().hashCode() +
        '#' +
        String(location.pathname.hashCode());
      // console.log(initkey);
      return useSession(initkey, value);
    };
    // Component.default.state = _RouterStore;
    // Component.states = _RouterStore;
    // window.useRouter = _RouterStore;
    // // scroll to top of the page
    // window.scrollTo(0, 0);

    return (
      <>
        <Component.default {...Comprops} />
      </>
    );
  }

  return <Error />;
};
async function getComponet(name, params) {
  let ret = await new Promise((resolve, reject) => {
    try {
      _ImportComp(name).then((comp) => {
        if (!comp) {
          _ImportComp(params.path).then((Comp2) => {
            if (Comp2) {
              resolve(Comp2);
            } else {
              Error.default = Error;
              resolve(Error);
            }
          });
        } else {
          resolve(comp);
        }
      });
    } catch (error) {
      Error.default = Error;
      resolve(Error);
    }
  });
  return ret;
}
export const RouterServer = (obs = {}) => {
  const [props, setprops] = useState(_ParseCompChildren(obs.children) || {});

  routes.setRoutes(props);
  for (const key in routes.routes) {
    _ImportComp(key);
  }
  const [params, setParams] = useState(_routeParser(props)); ///#hs

  const [Comprops, setComprops] = useState(params.props ? params.props : {});
  const [thisPath, setthisPath] = useState(location.pathname);
  for (const key in Comprops) {
    try {
      Comprops[key] = decodeURIComponent(Comprops[key]);
    } catch (error) {
      Comprops[key] = Comprops[key];
    }
  }
  const [name, setName] = useState(
    thisPath == '/' ? 'index' : thisPath.replace(/\//, '')
  );

  const [fallback, setFallback] = useState(obs.fallback ? obs.fallback : false);
  const [isLoading, setIsLoading] = useState(false);
  const [onunmount, setonunmount] = useState(() => {});
  const [Component, setComponent] = useState(
    React.lazy(async () => await getComponet(name, params))
  );
  useEffect(() => {
    let intv;

    if (window.addEventListener) {
      const setListen = () => {
        window.addEventListener('popstate', async (E) => {
          var name;
          var thisPath = location.pathname;
          thisPath == '/'
            ? (name = 'index')
            : (name = thisPath.replace(/\//, ''));
          for (const key in routes.routes) {
            if (thisPath == key) {
              name = key;
            }
          }
          setIsLoading(true);
          var newParams = _routeParser(routes.routes, thisPath);
          setComponent(
            React.lazy(async () => await getComponet(name, newParams))
          );
          setComprops({ ...newParams.props, ...E.detail });
          onunmount && onunmount();
          setonunmount(obs.onunmount ? obs.onunmount : () => {});
          setIsLoading(false);
        });
        clearInterval(intv);
      };
      setListen();
    } else {
      intv = setInterval(() => {
        if (window.addEventListener) {
          setListen();
        }
      }, 500);
    }

    // predownload all the components
    for (const key in routes.routes) {
      _ImportComp(key);
    }
    return () => {
      onunmount && onunmount();
    };
  }, []);

  if (isLoading) {
    if (fallback) {
      return fallback;
    }
    return <div> loading..</div>;
  }

  if (Component) {
    let _RouterStore = (value) => {
      let initkey =
        Component.default.toString().hashCode() +
        '#' +
        String(location.pathname.hashCode());
      return useSession(initkey, value);
    };
    try {
      Component.default.state = _RouterStore;
      Component.default.states = _RouterStore;
      globalThis.useRouter = _RouterStore;
      // scroll to top of the page
      window.scrollTo(0, 0);
    } catch (error) {}

    return (
      <>
        <React.Suspense
          fallback={() => {
            console.log('loaded', window.addEventListener);

            return <div>loading...</div>;
          }}
        >
          <Component {...Comprops} />
        </React.Suspense>
      </>
    );
  }

  return <Error />;
};

export function Route(props) {
  return <div {...props.props}></div>;
}
