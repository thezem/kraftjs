import React from 'kraftjs';
import { RouterServer, Route } from 'kraftjs/router';
import './App.css';

let Header = () => {
  return (
    <div className="header">
      <h1>Your Kraft App</h1>
    </div>
  );
};
// kraft renders components dynamically from ./src/pages based on user requests
// you can define your own "path to component" mapping and your paths as params

const App = () => {
  // ! This router is required by kraft
  return (
    <>
      <Header />
      <RouterServer>
        <Route path="/" Comp="index" />
        <Route path={['/page', '/page/:name']} Comp="page" />
      </RouterServer>
    </>
  );
};

export default App;
