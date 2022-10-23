# Kraftjs

# the crafted zero config React Framework

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
node kraft --build server
```

## maybe client side

```
node kraft --build client
```

### Wanna try somthing... real quick

```
> node kraft --dev 3000

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
