// @ts-nocheck
// Try not to change anything in this file

import React from 'kraftjs';
import { hydrate, render } from 'react-dom';
import { createRoot } from 'react-dom/client';

import App from './App';

function clientRenderd() {
  const container = document.getElementById('root');
  const CL = container.cloneNode(true);

  const root = createRoot(container);
  root.render(<App />);
  console.log('Client render');
}
function ServerRenderd() {
  const container = document.getElementById('root');

  try {
    hydrate(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      container
    );
    console.log('Hydrated');
  } catch (error) {
    console.log(error);
    console.log('Client render');
    render(<App />, container);
  }
}

if (typeof document !== 'undefined' && window.addEventListener) {
  if (window.kraftServer) {
    ServerRenderd();
  } else {
    clientRenderd();
  }
}
