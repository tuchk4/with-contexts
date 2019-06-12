import { createProvider } from './contexts';

function wait() {
  return new Promise(resolve => {
    setTimeout(() => resolve(), 0);
  });
}

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

describe('contexts', () => {
  it('counter context', () => {
    const provider = createProvider();
    const counterContext = provider.createContext<ICounter>(counter);

    provider.withContexts(() => {
      const counter = provider.useContext(counterContext);
      counter.inc();
      expect(counter.count).toEqual(1);
    });
  });

  it('shard counter context', () => {
    const provider = createProvider();
    const counterContext = provider.createContext<ICounter>(counter);

    provider.withContexts(() => {
      const counter1 = provider.useContext(counterContext);
      const counter2 = provider.useContext(counterContext);

      counter1.inc();
      counter2.inc();
      expect(counter1.count).toEqual(2);
      expect(counter2.count).toEqual(2);
    });
  });

  it('duplicate counter context', () => {
    const provider = createProvider();
    const counterContext1 = provider.createContext<ICounter>(counter);
    const counterContext2 = provider.duplicateContext(counterContext1);

    provider.withContexts(() => {
      const counter1 = provider.useContext(counterContext1);
      const counter2 = provider.useContext(counterContext2);

      counter1.inc();
      counter2.inc();
      expect(counter1.count).toEqual(1);
      expect(counter2.count).toEqual(1);
    });
  });

  it('counter context inner call', () => {
    const provider = createProvider();
    const counterContext = provider.createContext(counter);

    function inner() {
      const counter = provider.useContext(counterContext);
      counter.inc();
      expect(counter.count).toEqual(2);
    }

    provider.withContexts(() => {
      const counter = provider.useContext(counterContext);
      counter.inc();
      inner();
    });
  });

  it('counter with initial value', () => {
    const INITIAL_VALUE = 10;
    const provider = createProvider();
    const counterContext = provider.createContext<ICounter, number>(counter);
    provider.withValue(counterContext, INITIAL_VALUE);

    provider.withContexts(() => {
      const counter = provider.useContext(counterContext);

      counter.inc();
      expect(counter.count).toEqual(INITIAL_VALUE + 1);
    });
  });

  // --- Errors

  it('could not use withValue inside of withContexts', () => {
    const INITIAL_VALUE = 10;
    const provider = createProvider();
    const counterContext = provider.createContext<ICounter, number>(counter);

    let error = null;
    try {
      provider.withContexts(() => {
        provider.withValue(counterContext, INITIAL_VALUE);
        const counter = provider.useContext(counterContext);

        counter.inc();
        expect(counter.count).toEqual(INITIAL_VALUE + 1);
      });
    } catch (e) {
      error = e;
    }

    expect(error).not.toBe(null);
  });

  it('could not use useContext outside of withContexts', () => {
    const provider = createProvider();
    const counterContext = provider.createContext<ICounter>(counter);

    expect(() => provider.useContext(counterContext)).toThrowError();
  });

  it('could not use useContext after async', async () => {
    const provider = createProvider();
    const counterContext = provider.createContext<ICounter>(counter);

    let error = null;
    try {
      await provider.withContexts(async () => {
        await wait();
        const counter = provider.useContext(counterContext);
        counter.inc();
      });
    } catch (e) {
      error = e;
    }

    expect(error).not.toBeNull();
  });

  it('could not use createContext inside of withContexts', () => {
    const provider = createProvider();
    const counterContext = provider.createContext<ICounter>(counter);

    provider.withContexts(() => {
      const counter = provider.useContext(counterContext);
      counter.inc();
      expect(() => provider.createContext(() => ({}))).toThrowError();
    });
  });

  it.skip('could not use withContexts if it is already in progress', async () => {
    const provider = createProvider();
    const counterContext = provider.createContext<ICounter>(counter);

    provider.withContexts(async () => {
      await wait();
      const counter = provider.useContext(counterContext);
      counter.inc();
    });

    expect(() => {
      provider.withContexts(async () => {});
    }).toThrowError();
  });
});
