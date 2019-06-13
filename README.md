# Contexts

Contexts for javascript. Inspired by React contexts and hooks

## Usage

```js
import {
  creteContext,
  useContext,
  withContexts,
  withValue,
  createProvider,
  attach,
} from 'with-contexts';
```

```js
const counter = (value = 0) => {
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

const CounterContext = createContext(counter);

withContexts(() => {
  const counter = useContext(CounterContext);
  counter.inc();
  expect(counter.count).toEqual(1);

  innerCall();
});

function innerCall() {
  const counter = useContext(CounterContext);
  counter.inc();

  // NOTE  that count equal to "2"
  expect(counter.count).toEqual(2);
}
```

## Initial value

```js
const CounterContext = createContext(counter);
withValue(CounterContext, 10);
```

## Duplicate context

Will not share initial value.

```js
const CounterContext1 = createContext(counter);
const CounterContext2 = duplicateContext(CounterContext1);

withContexts(() => {
  const counter1 = useContext(CounterContext1);
  const counter2 = useContext(CounterContext2);

  counter1.inc();
  counter2.inc();

  expect(counter1.count).toEqual(1);
  expect(counter2.count).toEqual(1);

  innerCall();
});
```

## Attach contexts for lazy evaluation

```js
const counter = (value = 0) => {
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

const counterContext = createContext(counter);

function inc() {
  const counter = useContext(counterContext);
  counter.inc();

  return counter.count;
}

const api1 = withContexts(() => {
  return {
    inc: attach(inc),
  };
});

const api2 = withContexts(() => {
  return {
    inc: attach(inc),
  };
});

expect(api1.inc()).toEqual(1);
expect(api2.inc()).toEqual(1);
expect(api1.inc()).toEqual(2);
expect(api2.inc()).toEqual(2);
```

## Typings

```
createContext<ICountersInterface, InitialValueType>
```

```ts
interface ICounter {
  count: number;
  inc(): void;
}

const counter = (value = 0): ICounter => {
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

const CounterContext = createContext<ICounter, number>(counter);
// Actually it will work correctly without generics
// const CounterContext = createContext(counter);

withContexts(() => {
  // Will detect "counter" type and show all available methods and props
  const counter = useContext(CounterContext);

  counter.inc();
  counter.count;
});
```
