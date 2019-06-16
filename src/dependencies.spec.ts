import { createProvider } from './contexts';

describe('dependencies', () => {
  it('should rebuild context when withValue called', () => {
    const provider = createProvider();

    const left = provider.createContext(value => {
      return value + 1;
    });
    const right = provider.duplicateContext(left);

    const result = provider.createContext(() => {
      const leftValue = provider.useContext(left);
      const rightValue = provider.useContext(right);

      return leftValue + rightValue;
    });

    provider.withValue(left, 0);
    provider.withValue(right, 0);

    const api = provider.withContexts(() => {
      return {
        getResult: provider.attach(() => {
          return provider.useContext(result);
        }),
        update: provider.attach(value => {
          provider.withValue(left, value);
          provider.withValue(right, value);
        }),
      };
    });

    expect(api.getResult()).toEqual(2);
    api.update(1);
    expect(api.getResult()).toEqual(4);
  });

  it('should rebuild context when withValue called', () => {
    const provider = createProvider();

    const leftMock = jest.fn(value => {
      return value + 1;
    });
    const left = provider.createContext(leftMock);
    const rightMock = jest.fn(value => {
      return value + 1;
    });
    const right = provider.createContext(rightMock);

    const result = provider.createContext(() => {
      const leftValue = provider.useContext(left);
      const rightValue = provider.useContext(right);

      return leftValue + rightValue;
    });

    provider.withValue(left, 0);
    provider.withValue(right, 0);

    const api = provider.withContexts(() => {
      return {
        getResult: provider.attach(() => {
          return provider.useContext(result);
        }),
        update: provider.attach(value => {
          provider.withValue(left, value);
          provider.withValue(right, value);
        }),
      };
    });

    expect(api.getResult()).toEqual(2);
    expect(leftMock).toHaveBeenCalledTimes(1);
    expect(rightMock).toHaveBeenCalledTimes(1);

    expect(api.getResult()).toEqual(2);
    expect(leftMock).toHaveBeenCalledTimes(1);
    expect(rightMock).toHaveBeenCalledTimes(1);

    api.update(1);
    expect(api.getResult()).toEqual(4);
    expect(leftMock).toHaveBeenCalledTimes(2);
    expect(rightMock).toHaveBeenCalledTimes(2);
  });
});
