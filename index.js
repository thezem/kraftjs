//@ts-ignore

try {
  const arg = process.argv[2];
  if (arg) {
    let e = '';
    require(`./cli${e}`);
  }
} catch (error) {}

const React = require('react');

const NewReact = Object.assign({}, React);

const originalCreateElement = NewReact.createElement;
const { krFor, Head } = require('./beta');

const createElement = (...args) => {
  if (args[1] && args[1].hasOwnProperty('if')) {
    if (!args[1].if) {
      return null;
    } else {
      delete args[1].if;
    }
  }
  var ele = originalCreateElement(...args);
  return ele;
};

const { useRouter, InlineStyle } = require('./router/hooks');

NewReact.createElement = createElement;
module.exports = NewReact;
module.exports.useRouter = useRouter;
module.exports.InlineStyle = InlineStyle;
module.exports.Head = Head;
