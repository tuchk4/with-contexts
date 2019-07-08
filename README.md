# Contexts

Contexts for javascript. Inspired by React contexts and hooks

## Usage

```js
import {
  withProvider,
  attachContexts,
  duplicateContext,
  withContext,
  withValue,
  createScope,
} from 'with-contexts';
```

## Idea

Values of factory functions are the same for each `withContext` call inside one `withProvider` function.


```js
const Counter = (value = 0) => {
  let count = value;

  return {
    inc() {
      count++;
    },
    get count() {
      return count;
    },
  };
};

withProvider(() => {
  const counter = withContext(Counter);
  counter.inc();
  console.log(counter.value); // 1

  innerCall();
});

function innerCall() {
  const counter = withContext(Counter);
  counter.inc();

  console.log(counter.value); // 2
}
```

## Initial value

```js
const Counter = (value = 0) => {
  let count = value;

  return {
    inc() {
      count++;
    },
    get count() {
      return count;
    },
  };
};

withValue(Counter, 10);
```

```js
const Database = (url, port) => {
  // ...
}

withValue(Database, 'localhost', 6000);
```

## Duplicate context

Will not share value and initial value.

```js
const Counter = () => {
  let value = 0;
  return {
    inc() {
      value++;
    }
    get count() {
      return value;
    }
  }
}

const Counter2 = duplicateContext(Counter);

withProvider(() => {
  const counter1 = withContext(Counter);
  const counter2 = withContext(Counter2);

  counter1.inc();
  counter2.inc();

  console.log(counter1.count); // 
  console.log(counter2.count); // 
});
```

## Attach contexts for async / later calls

```js
const Database = (url, port) => {};

const api = withProvider(() => {
  return {
    query: attachContext(() => {
      const db = withContext(Database);
      db.query();
    }),
  };
});

api.query();
```

## Scope

Create context with value and clear it after end of function execution.

```js
const User = () => {
  return {};
}


function setName() {
  const user = withContext(User);
  user.name = 'John';
}

function setLastName() {
  const user = withContext(User);
  user.lastName = 'Doe';
}

function saveUser() {
  const user = withContext(User);
  const db = withContext(Database);

  // ...
}

const withUser = createScope(User);

withProvider(() => {
  withUser(() => {
    setName();
    setLastName();

    save();
  })
});
```

## Typings

```
createContext<ICountersInterface, InitialValueType>
```

```ts
const Counter = (value = 0) => {
  let count = value;
  return {
    inc() {
      count++;
    },
    get count() {
      return count;
    },
  };
};

// Actually it will work correctly without generics
// const CounterContext = createContext(counter);

withProvider(() => {
  // Will detect "counter" type and show all available methods and props
  const counter = withContext(Counter);

  counter.inc();
  counter.count;
});
```
