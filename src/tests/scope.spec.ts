import { createProvider } from '../contexts';

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

describe('scope', () => {
  it('counter scope', () => {
    const provider = createProvider();

    provider.withValue(counter, 20);

    function increment() {
      const c = provider.withContext(counter);
      c.inc();
    }

    const withCounter = provider.createScope(counter, 10);

    provider.withProvider(() => {
      withCounter(() => {
        increment();

        const c = provider.withContext(counter);
        expect(c.count).toEqual(11);
      });

      const c = provider.withContext(counter);
      expect(c.count).toEqual(20);
    });
  });

  it('nested counter scope', () => {
    const provider = createProvider();

    provider.withValue(counter, 20);

    function increment() {
      const c = provider.withContext(counter);
      c.inc();
    }

    const withCounter = provider.createScope(counter, 10);

    provider.withProvider(() => {
      withCounter(() => {
        increment();

        withCounter(() => {
          increment();
          increment();
          increment();

          const c = provider.withContext(counter);
          expect(c.count).toEqual(13);
        });

        const c = provider.withContext(counter);
        expect(c.count).toEqual(11);
      });

      const c = provider.withContext(counter);
      expect(c.count).toEqual(20);
    });
  });
});
