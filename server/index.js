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
  // console.log(list);
  return list[0] || { path: '404', props: {} };
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
    console.log(error);
    return { path: str, props: {} };
  }
}

async function Imported(name, importsX) {
  if (importsX[name]) {
    return await importsX[name].then((module) => {
      return module.default;
    });
  }
  return false;
}
function Error() {
  return (
    <div>
      <h1>404</h1>
      <p>Page not found</p>
    </div>
  );
}
async function RouterForServer(obs, importsX = {}) {
  let props = _ParseCompChildren(obs);
  let params = _routeParser(props);
  let thisPath = location.pathname;
  let Comprops = params.props;
  for (const key in Comprops) {
    try {
      Comprops[key] = decodeURIComponent(Comprops[key]);
    } catch (error) {
      Comprops[key] = Comprops[key];
    }
  }

  let name;
  thisPath == '/' ? (name = 'index') : (name = thisPath.replace(/\//, ''));
  Imported('./pages/' + name + '.js', importsX);
  Imported('./pages/' + name + '/index.js', importsX);
  let Comp =
    (await Imported('./pages/' + name, importsX).catch(async (err) => {
      return false;
    })) ||
    (await Imported('./pages/' + name + '.js', importsX).catch(async (err) => {
      return false;
    })) ||
    (await Imported('./pages/' + name + '/index.js', importsX).catch(async (err) => {
      return false;
    })) ||
    (await Imported('./pages/' + params.path + '.js', importsX).catch((err) => {
      return false;
    })) ||
    (await Imported('./pages/' + params.path + '/index.js', importsX).catch((err) => {
      return false;
    }));

  if (Comp) {
    console.log('Comp', Comp,params,name);
    return { Comp, props: Comprops };
  } else {
    console.log(Comp);
    return { Comp: Error, props: {} };
  }
}
// console.log(importsX);
export default RouterForServer;
