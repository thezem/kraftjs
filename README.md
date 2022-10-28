# Kraftjs

## The Crafted Zero Config React Framework

## Quick start

```
> npm init -y
> npm i https://github.com/antiihope/kraftjs.git
> npm i express react-dom@18.2.0
> kraftjs --setup // <-- setup your public and src directory in instant
> kraftjs --dev

>> Your kraft App is ready to go!
>> server started at http://localhost:3000
>> Serving "./public/dist" at http://localhost:3000 (http://127.0.0.1:3000
```

## ✨ Features ✨

### Rendering elements conditionally

Using if Statment as attributes , and only render element if condition is true

```
import React,{useState} from 'kraftjs';


function Home() {
  const [data, setData] = useState('loading');
  return (
    <div>
      <h1 if={data == 'loading'}>
        just a sec loading...
      </h1>

      <h1 if={data == 'loaded'}>
        your name is {data.name}
        </h1>
    </div>
  );
}

```

## build for server side rendering

```
kraftjs --build server
```

## maybe client side

```
kraftjs --build client
```

### Wanna try somthing... real quick

```
> kraftjs --dev 3000

> server started at http://localhost:3000
> Serving "./public/dist" at http://localhost:3000 (http://127.0.0.1:3000
```

## Behold your "no problem" router that runs server/client-side

### minimize the number of javascript on client-side, load pages only on demand

```
// #/src/App.js


import React from 'kraftjs';
import { RouterServer, Route } from 'kraftjs/router';


// kraft renders components dynamically from /src/pages based on user requests
// you can define your own "path to component" mapping and your paths as params

const App = () => {
  return (
    <>
      <RouterServer>
        <Route path="/" Comp="index" />
        <Route path={['/user', '/user/:name']} Comp="user" />
      </RouterServer>
    </>
  );
};

export default App
```

## Write, Serve and develop your API & App in one page

### with Expressjs \_\_\_

```
// #/src/server.js

import App from './App.js';
import KraftServer from 'kraftjs/ssr';

const KraftApp = new KraftServer({ App });

const app = KraftApp(); // kraft will automatically respond to requests with html ...

// ... Unless you say otherwise
app.get('/customRoute', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, '0.0.0.0', () => {
  console.log(`${new Date()} Kraft App listening on port 3000`);
});

export default app;
```

###### !NO HASSL3 GODS

###### @antiihope

```

```
