import { createContext } from './createContext';

function wait(time = 0) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), time);
  });
}

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

describe('createContext', () => {
  it('context', () => {
    const CounterContext = createContext(counter);

    CounterContext.Provider(() => {
      const counter = CounterContext.Consumer();
      counter.inc();
      expect(counter.count).toEqual(1);
    });
  });

  it('Consumer out of Provider', () => {
    const CounterContext = createContext(counter);

    expect(() => CounterContext.Consumer()).toThrow();
  });

  it('nested Providers & Consumers as links', () => {
    const CounterContext = createContext(counter);

    CounterContext.Provider(() => {
      const counter = CounterContext.Consumer();
      counter.inc();
      expect(counter.count).toEqual(1);

      CounterContext.Provider(() => {
        const counter = CounterContext.Consumer();
        counter.inc();
        counter.inc();
        expect(counter.count).toEqual(2);

        CounterContext.Provider(() => {
          const counter = CounterContext.Consumer();
          counter.inc();
          counter.inc();
          counter.inc();
          counter.inc();
          expect(counter.count).toEqual(4);
        });

        counter.inc();
        expect(counter.count).toEqual(3);
      });

      counter.inc();
      expect(counter.count).toEqual(2);
    });
  });

  it('nested context & new Consumers after child Provider', () => {
    const CounterContext = createContext(counter);

    CounterContext.Provider(() => {
      const counter = CounterContext.Consumer();
      counter.inc();

      CounterContext.Provider(() => {
        const counter = CounterContext.Consumer();
        counter.inc();
        expect(counter.count).toEqual(1);
      });

      const _counter = CounterContext.Consumer();
      _counter.inc();
      expect(counter.count).toEqual(2);
    });
  });
});

describe('Provider return with Consumer links', () => {
  it('provider return', () => {
    const CounterContext = createContext(counter);

    const api = CounterContext.Provider(() => {
      const counter = CounterContext.Consumer();
      counter.inc();

      return {
        inc: counter.inc,
        getValue: () => counter.count,
      };
    });

    api.inc();
    expect(api.getValue()).toEqual(2);
  });

  it('nested fields', () => {
    const CounterContext = createContext(counter);

    const api = CounterContext.Provider(() => {
      const counter = CounterContext.Consumer();
      counter.inc();

      return {
        a: {
          b: {
            c: {
              inc: counter.inc,
              d: {
                getValue: () => counter.count,
              },
            },
          },
        },
      };
    });

    api.a.b.c.inc();
    expect(api.a.b.c.d.getValue()).toEqual(2);
  });

  it('function', () => {
    const CounterContext = createContext(counter);
    const getValue = CounterContext.Provider(() => {
      const counter = CounterContext.Consumer();

      return () => {
        counter.inc();
        return counter.count;
      };
    });

    expect(getValue()).toEqual(1);
    expect(getValue()).toEqual(2);
  });

  it('nested function', () => {
    const CounterContext = createContext(counter);
    const getApi = CounterContext.Provider(() => {
      const counter = CounterContext.Consumer();

      return () => {
        return {
          inc() {
            counter.inc();
          },
          getValue() {
            return counter.count;
          },
        };
      };
    });

    const api = getApi();
    api.inc();
    expect(api.getValue()).toEqual(1);
  });
});

describe('Provider return with new Consumer calls (proxy)', () => {
  it('provider return', () => {
    const CounterContext = createContext(counter);

    const api = CounterContext.Provider(() => {
      const counter = CounterContext.Consumer();
      counter.inc();

      return {
        inc: () => {
          const counter = CounterContext.Consumer();
          counter.inc();
        },
        inc2: () => {
          const counter = CounterContext.Consumer();
          counter.inc();
        },
        getValue: () => {
          const counter = CounterContext.Consumer();
          return counter.count;
        },
      };
    });

    api.inc();
    api.inc2();
    expect(api.getValue()).toEqual(3);
  });

  it('provider return & the ONLY Consumer in returned value', () => {
    const CounterContext = createContext(counter);

    const api = CounterContext.Provider(() => {
      return {
        inc: () => {
          const counter = CounterContext.Consumer();
          counter.inc();
        },
        inc2: () => {
          const counter = CounterContext.Consumer();
          counter.inc();
        },
        getValue: () => {
          const counter = CounterContext.Consumer();
          return counter.count;
        },
      };
    });

    api.inc();
    api.inc2();
    expect(api.getValue()).toEqual(2);
  });

  it('nested fields (proxy)', () => {
    const CounterContext = createContext(counter);

    const api = CounterContext.Provider(() => {
      return {
        a: {
          b: {
            c: {
              inc: () => {
                const counter = CounterContext.Consumer();
                counter.inc();
              },
              d: {
                getValue: () => {
                  const counter = CounterContext.Consumer();
                  return counter.count;
                },
              },
            },
          },
        },
      };
    });

    api.a.b.c.inc();
    expect(api.a.b.c.d.getValue()).toEqual(1);
  });

  it('function', () => {
    const CounterContext = createContext(counter);
    const getValue = CounterContext.Provider(() => {
      const counter = CounterContext.Consumer();
      counter.inc();

      return () => {
        const counter = CounterContext.Consumer();
        counter.inc();
        return counter.count;
      };
    });

    expect(getValue()).toEqual(2);
    expect(getValue()).toEqual(3);
  });

  it('nested function', () => {
    const CounterContext = createContext(counter);
    const getApi = CounterContext.Provider(() => {
      return () => {
        return {
          inc() {
            const counter = CounterContext.Consumer();
            counter.inc();
          },
          getValue() {
            const counter = CounterContext.Consumer();
            return counter.count;
          },
        };
      };
    });

    const api = getApi();
    api.inc();
    expect(api.getValue()).toEqual(1);
  });
});

describe('async', () => {});
