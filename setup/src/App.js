import React from 'kraft';
import { RouterServer, Route } from 'kraft/router';

// kraft renders components dynamically from ./src/pages based on user requests
// you can define your own "path to component" mapping and your paths as params

const App = () => {
  // ! This router is required by kraft
  return (
    <>
      <RouterServer>
        <Route path="/" Comp="index" />
        <Route path={['/user', '/user/:name']} Comp="user" />
      </RouterServer>
    </>
  );
};

export default App;
