import React, { useState, useEffect } from 'react';
var window = globalThis || {};

function useSession(defKey, defaultValue = false) {
  AppLocals['_reactKeys'] = AppLocals['_reactKeys'] || {};

  let len = Object.keys(AppLocals['_reactKeys']).length;
  if (len > 22) {
    let newKeys = AppLocals['_reactKeys'];
    delete newKeys[valus[0]];
    AppLocals['_reactKeys'] = newKeys;
  }

  var _reactKeys = globalThis._reactKeys || {};

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
        AppLocals['_reactKeys'] = window._reactKeys;

        return defaultValue;
      }
    } catch (err) {
      return defaultValue;
    }
  });

  const setValue = (newValue) => {
    try {
      window._reactKeys[defKey][keyName] = JSON.stringify(newValue);
      AppLocals['_reactKeys'] = _reactKeys;
      setStoredValue(newValue);
    } catch (err) {}
    setStoredValue(newValue);
  };

  return [storedValue, setValue];
}

String.prototype.hashCode = function () {
  var hash = 0;
  for (var i = 0; i < this.length; i++) {
    var char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};
let _RouterStore = (value) => {
  try {
    let initkey = '#' + String(location.pathname.hashCode());
    return useSession(initkey, value);
  } catch (error) {
    return value;
  }
};

const InlineStyle = ({ theme }) => {
  let styleStr = '';
  for (var key in theme) {
    for (var style in theme[key]) {
      styleStr += `${key} { ${style}: ${theme[key][style]} }`;
    }
  }
  return <style>{styleStr}</style>;
};
module.exports = {
  useRouter: _RouterStore,
  InlineStyle,
};
