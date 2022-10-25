# Kraftjs

# the crafted zero config React Framework

## Quick start

```
> npm init -y
> npm i https://github.com/antiihope/kraftjs.git
> npm i express react-dom@18.2.0
> kraftjs --setup // <-- setup your public and src directory in instant
> kratjs --dev

>> Your kraft App is ready to go!
>> server started at http://localhost:3000
>> Serving "./public/dist" at http://localhost:3000 (http://127.0.0.1:3000
```

## ✨ Features ✨

### Rendering elements conditionally

Using if Statment as attributes , and only render element if condition is true

```
import React,{useState} from 'kraft';


function Home() {
  const [data, setData] = useState('loading');
  return (
    <div>
      <h1 if={data == 'loading'}>
        <div>just a sec loading...</div>
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
kratjs --build server
```

## maybe client side

```
kratjs --build client
```

### Wanna try somthing... real quick

```
> kratjs --dev 3000

> server started at http://localhost:3000
> Serving "./public/dist" at http://localhost:3000 (http://127.0.0.1:3000
```

## behold your "no problem" router that runs server-side/client-side

### minimizing the number of javascript on client-side, load pages only on demand

```
const App = () => {
  return (
    <>
      <RouterServer path="./pages/">
        <Route path="/" Comp="index" />
        <Route path={['/user', '/user/:name']} Comp="user" />
      </RouterServer>
    </>
  );
};

export default App
```
