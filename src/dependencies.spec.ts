import { createProvider } from './contexts';

describe('dependencies', () => {
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

  it('should work correct with nested context deps', () => {
    // A -> B -> C -> D

    const provider = createProvider();

    const AMock = jest.fn((value = 'def') => {
      return `A:${value}`;
    });
    const A = provider.createContext(AMock);

    const BMock = jest.fn((value = 'def') => {
      const AValue = provider.useContext(A);
      return `${AValue}_B:${value}`;
    });
    const B = provider.createContext(BMock);

    const CMock = jest.fn((value = 'def') => {
      const BValue = provider.useContext(B);
      return `${BValue}_C:${value}`;
    });
    const C = provider.createContext(CMock);

    const DMock = jest.fn((value = 'def') => {
      const CValue = provider.useContext(C);
      return `${CValue}_D:${value}`;
    });

    const D = provider.createContext(DMock);

    const api = provider.withContexts(() => {
      return {
        update: provider.attach((context, value) => {
          provider.withValue(context, value);
        }),
        getValue: provider.attach(() => {
          return provider.useContext(D);
        }),
      };
    });

    expect(api.getValue()).toEqual('A:def_B:def_C:def_D:def');
    api.update(A, 'custom');
    expect(api.getValue()).toEqual('A:custom_B:def_C:def_D:def');
    expect(AMock).toHaveBeenCalled();
    expect(BMock).toHaveBeenCalled();
    expect(CMock).toHaveBeenCalled();
    expect(DMock).toHaveBeenCalled();
  });

  it('should rebuild only affected contexts', () => {
    const provider = createProvider();

    const AMock = jest.fn((value = 'def') => {
      return `A:${value}`;
    });
    const A = provider.createContext(AMock);

    const BMock = jest.fn((value = 'def') => {
      const AValue = provider.useContext(A);
      return `${AValue}_B:${value}`;
    });
    const B = provider.createContext(BMock);

    const CMock = jest.fn((value = 'def') => {
      const BValue = provider.useContext(B);
      return `${BValue}_C:${value}`;
    });
    const C = provider.createContext(CMock);

    const DMock = jest.fn((value = 'def') => {
      const CValue = provider.useContext(C);
      return `${CValue}_D:${value}`;
    });

    const D = provider.createContext(DMock);

    const api = provider.withContexts(() => {
      return {
        update: provider.attach((context, value) => {
          provider.withValue(context, value);
        }),
        getValue: provider.attach(() => {
          return provider.useContext(D);
        }),
      };
    });

    expect(api.getValue()).toEqual('A:def_B:def_C:def_D:def');
    api.update(C, 'custom');
    expect(api.getValue()).toEqual('A:def_B:def_C:custom_D:def');
    expect(AMock).toHaveBeenCalledTimes(1);
    expect(BMock).toHaveBeenCalledTimes(1);
    expect(CMock).toHaveBeenCalledTimes(2);
    expect(DMock).toHaveBeenCalledTimes(2);
  });

  it('should work correct with cycle deps', () => {
    const provider = createProvider();

    const c1 = provider.createContext(() => {
      provider.useContext(c8);
      return '_';
    }, '1');
    const c2 = provider.createContext(() => provider.useContext(c1), '2');
    const c3 = provider.createContext(() => {
      return provider.useContext(c2);
    }, '3');
    const c4 = provider.createContext(() => provider.useContext(c3), '4');
    const c5 = provider.createContext(() => {
      return provider.useContext(c4);
    }, '5');
    const c6 = provider.createContext(() => provider.useContext(c5), '6');
    const c7 = provider.createContext(() => provider.useContext(c6), '7');
    const c8 = provider.createContext(() => provider.useContext(c7), '8');

    // const n1 = provider.createContext(() => 'n1', 'n1');
    // const n2 = provider.createContext(() => 'n2', 'n2');
    // const n3 = provider.createContext(() => 'n3', 'n3');
    // const n4 = provider.createContext(() => 'n4', 'n4');

    const api = provider.withContexts(() => {
      return {
        update: provider.attach((context, value) => {
          provider.withValue(context, value);
        }),
        getValue: provider.attach(() => {
          return provider.useContext(c8);
        }),
      };
    });

    expect(() => api.getValue()).toThrow();
  });

  it('should work correct with cycle deps', () => {
    // A -> B -> A
    const provider = createProvider();

    const AMock = jest.fn((value = 'def') => {
      const BValue = provider.useContext(B);
      return `A:${value}_${BValue}`;
    });
    const A = provider.createContext(AMock, 'aMock');

    const BMock = jest.fn((value = 'def') => {
      const AValue = provider.useContext(A);
      return `${AValue}_B:${value}`;
    });
    const B = provider.createContext(BMock, 'bMock');

    const CMock = jest.fn(() => {
      const BValue = provider.useContext(B);
      return `${BValue}_at_C`;
    });
    const C = provider.createContext(CMock, 'cMock');

    const api = provider.withContexts(() => {
      return {
        update: provider.attach((context, value) => {
          provider.withValue(context, value);
        }),
        getValue: provider.attach(() => {
          return provider.useContext(C);
        }),
      };
    });

    expect(() => api.getValue()).toThrow();
  });
});
