import { createContext } from './createContext';

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

describe('mockContexts', () => {
  it('mock', () => {
    const CounterContext = createContext(counter);

    const mock = jest.fn(() => {
      return {
        inc() {},
        count: 0,
      };
    });

    CounterContext.replaceFactory(mock);

    CounterContext.Provider(() => {
      const counter = CounterContext.Consumer();
      counter.inc();
      expect(mock).toHaveBeenCalledTimes(1);
    });
  });

  it('should throw exception if `replaceFactory` after Provider (1)', () => {
    const CounterContext = createContext(counter);
    const mock = jest.fn(() => {
      return {
        inc() {},
        count: 0,
      };
    });

    expect(() => {
      CounterContext.Provider(() => {
        CounterContext.replaceFactory(mock);

        const counter = CounterContext.Consumer();
        counter.inc();
      });
    }).toThrow();
  });

  it('should throw exception if `replaceFactory` after Provider (2)', () => {
    const CounterContext = createContext(counter);
    const mock = jest.fn(() => {
      return {
        inc() {},
        count: 0,
      };
    });

    CounterContext.Provider(() => {
      const counter = CounterContext.Consumer();
      counter.inc();
    });

    expect(() => {
      CounterContext.replaceFactory(mock);
    }).toThrow();
  });
});
