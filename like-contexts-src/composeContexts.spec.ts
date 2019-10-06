import { createContext } from './createContext';
import { composeContexts } from './composeContexts';

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

// https://pbs.twimg.com/media/CbCUXkKW4AEk-s9.jpg
const randomNumber = () => {
  return 4;
};

const randomString = () => {
  let i = 0;
  return {
    getString() {
      return 'x' + i;
    },
    touch() {
      i++;
    },
  };
};

describe('composeContexts', () => {
  it('providers', () => {
    const CounterContext = createContext(counter);
    const RandomNumberContext = createContext(randomNumber);
    const RandomStringContext = createContext(randomString);

    const Providers = composeContexts(
      CounterContext,
      RandomNumberContext,
      RandomStringContext
    );

    Providers(() => {
      const counter = CounterContext.Consumer();
      counter.inc();
      expect(counter.count).toEqual(1);

      const num = RandomNumberContext.Consumer();
      expect(num).toEqual(4);

      const str = RandomStringContext.Consumer();
      str.touch();
      expect(str.getString()).toEqual('x1');
    });
  });

  it('nested providers', () => {
    const CounterContext = createContext(counter);
    const RandomNumberContext = createContext(randomNumber);
    const RandomStringContext = createContext(randomString);

    const Providers = composeContexts(
      CounterContext,
      RandomNumberContext,
      RandomStringContext
    );

    Providers(() => {
      const counter = CounterContext.Consumer();
      counter.inc();
      expect(counter.count).toEqual(1);

      const num = RandomNumberContext.Consumer();
      expect(num).toEqual(4);

      Providers(() => {
        const counter = CounterContext.Consumer();
        counter.inc();
        expect(counter.count).toEqual(1);

        const num = RandomNumberContext.Consumer();
        expect(num).toEqual(4);

        Providers(() => {
          const counter = CounterContext.Consumer();
          counter.inc();
          expect(counter.count).toEqual(1);

          const num = RandomNumberContext.Consumer();
          expect(num).toEqual(4);

          const str = RandomStringContext.Consumer();
          str.touch();
          str.touch();
          str.touch();
          expect(str.getString()).toEqual('x3');
        });

        const str = RandomStringContext.Consumer();
        str.touch();
        str.touch();
        expect(str.getString()).toEqual('x2');
      });

      const str = RandomStringContext.Consumer();
      str.touch();
      expect(str.getString()).toEqual('x1');
    });
  });
});
