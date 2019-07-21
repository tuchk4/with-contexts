import { createProvider } from '../contexts';

function wait() {
  return new Promise(resolve => {
    setTimeout(() => resolve(), 0);
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

describe('contexts', () => {
  it('counter context', () => {
    const provider = createProvider();

    provider.withProvider(() => {
      const c = provider.withContext(counter);
      c.inc();
      expect(c.count).toEqual(1);
    });
  });

  it('shard counter context', () => {
    const provider = createProvider();

    provider.withProvider(() => {
      const c1 = provider.withContext(counter);
      const c2 = provider.withContext(counter);

      c1.inc();
      c2.inc();
      expect(c1.count).toEqual(2);
      expect(c2.count).toEqual(2);
    });
  });

  it('duplicate counter context', () => {
    const provider = createProvider();
    const counter2 = provider.duplicateContext(counter);

    provider.withProvider(() => {
      const c1 = provider.withContext(counter);
      const c2 = provider.withContext(counter2);

      c1.inc();
      c2.inc();
      expect(c1.count).toEqual(1);
      expect(c2.count).toEqual(1);
    });
  });

  it('counter context inner call', () => {
    const provider = createProvider();

    function inner() {
      const c = provider.withContext(counter);
      c.inc();
      expect(c.count).toEqual(2);
    }

    provider.withProvider(() => {
      const c = provider.withContext(counter);
      c.inc();
      inner();
    });
  });

  it('counter with initial value', () => {
    const INITIAL_VALUE = 10;
    const provider = createProvider();
    provider.withValue(counter, INITIAL_VALUE);

    provider.withProvider(() => {
      const c = provider.withContext(counter);

      c.inc();
      expect(c.count).toEqual(INITIAL_VALUE + 1);
    });
  });

  it('counter with initial value set inside withProvider', () => {
    const INITIAL_VALUE = 10;
    const provider = createProvider();

    provider.withProvider(() => {
      provider.withValue(counter, INITIAL_VALUE);
      const c = provider.withContext(counter);
      // will not work if called after withContexts
      // provider.withValue(counter, INITIAL_VALUE);

      c.inc();
      expect(c.count).toEqual(INITIAL_VALUE + 1);
    });
  });

  it('multiple withProviders', async () => {
    const provider = createProvider();

    function inc() {
      const c = provider.withContext(counter);
      c.inc();

      return c.count;
    }

    const api1 = provider.withProvider(() => {
      return {
        inc: provider.attachContexts(inc),
      };
    });

    const api2 = provider.withProvider(() => {
      return {
        inc: provider.attachContexts(inc),
      };
    });

    expect(api1.inc()).toEqual(1);
    expect(api2.inc()).toEqual(1);

    expect(api1.inc()).toEqual(2);
    expect(api2.inc()).toEqual(2);
  });

  it('multiple async withProviders', async () => {
    const provider = createProvider();

    function inc() {
      const c = provider.withContext(counter);
      c.inc();

      return c.count;
    }

    const api1 = await provider.withProvider(async () => {
      await wait();

      return {
        inc: provider.attachContexts(inc),
      };
    });

    const api2 = await provider.withProvider(async () => {
      await wait();
      return {
        inc: provider.attachContexts(inc),
      };
    });

    expect(api1.inc()).toEqual(1);
    expect(api2.inc()).toEqual(1);

    expect(api1.inc()).toEqual(2);
    expect(api2.inc()).toEqual(2);
  });

  it('use withContext after async', async () => {
    const provider = createProvider();

    const api = await provider.withProvider(async () => {
      await wait();
      const c = provider.withContext(counter);

      return {
        inc: c.inc,
        getValue: provider.attachContexts(() => {
          return provider.withContext(counter).count;
        }),
      };
    });

    expect(api.getValue()).toEqual(0);
    api.inc();
    expect(api.getValue()).toEqual(1);
  });

  // --- Errors
  it('should throw if multiple async withProviders without await', async () => {
    const provider = createProvider();

    function inc() {
      const c = provider.withContext(counter);
      c.inc();

      return c.count;
    }

    provider.withProvider(async () => {
      await wait();

      return {
        inc: provider.attachContexts(inc),
      };
    });

    expect(() => provider.withProvider(() => {})).toThrow();
  });

  it('should throw if withContext is using outside of withContexts', () => {
    const provider = createProvider();

    expect(() => provider.withContext(counter)).toThrowError();
  });

  it('should throw if attachContexts is using outside of withContexts', () => {
    const provider = createProvider();

    expect(() => provider.attachContexts(counter)).toThrowError();
  });

  it('should throw if withProvider is using inside another withProvider', () => {
    const provider = createProvider();

    provider.withProvider(() => {
      const c = provider.withContext(counter);
      c.inc();
      expect(() => provider.withProvider(() => ({}))).toThrowError();
    });
  });
});
