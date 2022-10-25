const React = require('react');

const { renderToString } = require('react-dom/server');

const Head = (props) => {
  if (typeof document !== 'undefined') {
    let headHtml = document.querySelector('head').innerHTML;
    let elHtml = React.createElement('head', props, props.children);
    let elHtmlString = renderToString(elHtml)
      .replace('<head>', '')
      .replace('</head>', '');
    if (headHtml.indexOf(elHtmlString) === -1) {
      document.querySelector('head').innerHTML = headHtml
        .replace('<head>', '')
        .replace('</head>', '');
    }
    return;
  }
  return React.createElement('head', props, props.children);
};
