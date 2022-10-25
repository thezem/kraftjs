import React from 'kraft';
import { RouterServer, Route } from 'kraft/router';
import './App.css';

let Header = () => {
  return (
    <div className="header">
      <h1>Your Kraft App</h1>
    </div>
  );
};
const App = () => {
  // kraft renders components dynamically when based on what the user requests
  // but you can define your own path to component mapping and define paths as params
  // ! This router is required for kraft to work !
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
