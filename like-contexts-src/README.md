# Contexts for Javascript

Inspired by React Contexts and implements very similar api.

```js
import { createContext } from '';

const CounterContext = createContext(() => {
  let counter = 0;
  return {
    increment() {
      counter++;
    },
    getValue() {
      return counter;
    },
  };
});

CounterContext.Provider(() => {
  const counter = CounterContext.Consumer();
  counter.increment();

  innerCall();
});

function innerCall() {
  const counter = CounterContext.Consumer();
  console.log(counter.getValue()); // 1;
}
```

### Compose contexts

```js
import { composeContexts, createContext } from '';

const Context1 = createContext(() => {});
const Context2 = createContext(() => {});
const Context3 = createContext(() => {});

const Provider = composeContexts(Context1, Context2, Context3);

Provider(() => {
  const value1 = Context1.Consumer();
  const value2 = Context2.Consumer();
  const value3 = Context3.Consumer();
});
```

### Mock context

```js
import { mockContext } from '';
import { CounterContext } from './counter';

mockContext(CounterContext, () => {
  return {
    inc: jest.fn(),
    getValue: jest.fn(),
  };
});
```
