# klass

# Rendering elements conditionally in react

## Using if Statment as attributes , and only render element if condition is true

# Usage

```
import React from 'klass';

function Home() {
  return (
    <>

      <div if={Loading}> // render only if Loading is true
        <Loading />
      </div>

      <div if={Loading == false}> // render only if Done Loading
        {...Content}
        </div>

    </>
  );
}

```
