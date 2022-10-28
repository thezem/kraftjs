const React = require('react');
const { useEffect } = React;
const { hydrate } = require('react-dom');
const originalCreateElement = React.createElement;

let toArr = (kids) => {
  if (Array.isArray(kids)) {
    return kids;
  }
  if (kids) {
    return [kids];
  }
};
let krFor = (args) => {
  let els = args[1].krFor;
  if (!Array.isArray(els)) {
    console.error(
      new Error('krFor only works with arrays; found ' + typeof els),
      args[1].krFor,
      'At',
      args[0],
      args[1]
    );
    delete args[1].krFor;
    return;
  }
  //console.log('els', els);
  let ele = originalCreateElement(...args);
  //console.log(ele);
  let kids = toArr(ele.props.children);
  //console.log(JSON.stringify(kids));
  let newKids = [];
  els.forEach((el) => {
    newKids.push(kids);
  });
  let parsedKid = [];
  var krPut = args[1].krFor;

  krPut.forEach((e, i) => {
    let kid = JSON.stringify(newKids[i]);
    // match "@.*""
    var krPut = args[1].krFor;

    let match = kid.match(/@.[A-z-0-9]+/g);
    // match for "@"
    let match2 = kid.match(/"XrAll"/g);
    if (match) {
      //console.log('match', match);
      var krPut = args[1].krFor;
      match.forEach((m) => {
        let value = m.replace('@.', '');
        // value = value.replace('"', '');
        if (e.hasOwnProperty(value)) {
          kid = kid.replace(m, e[value]);
          //console.log('kid', kid);
        } else {
          kid = kid.replace(m, undefined);
        }
      });
    }
    if (match2) {
      var krPut = args[1].krFor;
      match2.forEach((m) => {
        let value = m.replace('@.', '');
        value = value.replace('"', '');
        console.log(e, m);
        let str = '';
        for (let key in e) {
          console.log(key, e[key]);
          str += key + "='" + e[key] + "' ";
        }
        kid = kid.replace(m, JSON.stringify(str));
        // console.log('kid', m, mid);
        console.log('kid', m, JSON.parse(kid));
      });
    }
    parsedKid.push(JSON.parse(kid));
  });
  parsedKid = parsedKid.flat();
  parsedKid = parsedKid.map((e) => {
    return originalCreateElement(e.type, e.props, e.props.children);
  });
  //console.log('parsedKid', parsedKid);
  // let newEle = originalCreateElement(
  //   ele.type,
  //   { ...ele.props, children: parsedKid },
  //   parsedKid
  // );
  // ele.props.children = parsedKid;
  // console.log(ele, newEle);
  //console.log(args);
  args = [args[0], args[1], ...parsedKid];
  // args[2] = parsedKid[2];
  //console.log(args);
  delete args[1].krFor;
  return originalCreateElement(...args);
};

let str = JSON.stringify;

const customToStaticMarkup = (ele) => {
  let str = '';
  if (ele.type === 'style') {
    str = '<style>' + ele.props.children + '</style>';
  } else {
    let props = Object.keys(ele.props ? ele.props : {})
      .map((e) => {
        if (e === 'children') {
          return '';
        }

        return e + '="' + ele.props[e] + '"';
      })
      .join(' ');
    str = `<${ele.type} ${props}>`;

    if (ele.props?.children) {
      if (Array.isArray(ele.props.children)) {
        toArr(ele.props.children).forEach((e) => {
          try {
            if (typeof e == 'function') {
              str += customToStaticMarkup(e());
            } else {
              str += customToStaticMarkup(e);
            }
          } catch (error) {
            return;
          }
        });
      } else {
        if (typeof ele.props.children === 'string') {
          str += ele.props.children;
        } else {
          if (typeof e == 'function') {
            str += customToStaticMarkup(ele.props.children());
          } else {
            str += customToStaticMarkup(ele.props.children);
          }
        }
      }
    }
    str += `</${ele.type}>`;
  }

  return str;
};
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
let Null = (props) => {
  return <>{props.children}</>;
};
const Head = (props) => {
  let el = <Null>{props.children}</Null>;
  useEffect(() => {
    const container = document.querySelector('head');
    hydrate(el, container);
    return () => {
      hydrate(<Null />, container);
    };
  }, []);
  if (typeof document !== 'undefined') {
    return null;
  }
  let ServerSideEl = originalCreateElement('head', props, props.children);
  return ServerSideEl;
};

module.exports = {
  krFor: krFor,
  Head: Head,
  customToStaticMarkup: customToStaticMarkup,
};
