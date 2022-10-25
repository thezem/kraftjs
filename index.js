// import React from 'react';
//@ts-ignore

try {
  const arg = process.argv[2];

  if (arg) {
    let e = '';
    return require(`./cli.js${e}`);
  }
} catch (error) {}
try {
  global.performance = global.performance || {
    now: () => new Date().getTime(),
  };
} catch (error) {}

var window = window || {};

const React = require('react');

const NewReact = Object.assign({}, React);

const originalCreateElement = NewReact.createElement;
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
const createElement = (...args) => {
  // if (args[1] && args[1].hasOwnProperty('krFor')) {
  //   return krFor(args);
  // }
  if (args[1] && args[1].hasOwnProperty('if')) {
    if (!args[1].if) {
      return null;
    } else {
      delete args[1].if;
    }
  }
  // // remove first two args
  // let newArgs = args.slice(2);
  // let newKids = toArr(newArgs);
  // newKids = newKids.map((e) => {
  //   if (typeof e === 'string') {
  //     return e;
  //   }
  //   if (typeof e == 'object') {
  //     e.key = e.key || Math.random();
  //   }
  //   return e;
  // });
  // let newEl = [args[0], args[1], newKids];
  var ele = originalCreateElement(...args);
  return ele;
};

const { useRouter, InlineStyle } = require('./router/hooks');

NewReact.createElement = createElement;
module.exports = NewReact;
window.React = NewReact;
globalThis.React = NewReact;
module.exports.useRouter = useRouter;
module.exports.InlineStyle = InlineStyle;
