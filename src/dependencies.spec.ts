import { createProvider } from './contexts';

describe('dependencies', () => {
  it('should rebuild context when withValue called', () => {
    const provider = createProvider();

    const A = jest.fn(value => {
      return value + 1;
    });
    const B = jest.fn(value => {
      return value + 1;
    });

    const result = () => {
      const aValue = provider.withContext(A);
      const bValue = provider.withContext(B);

      return aValue + bValue;
    };

    provider.withValue(A, 0);
    provider.withValue(B, 0);

    const api = provider.withProvider(() => {
      return {
        getResult: provider.attachContexts(() => {
          return provider.withContext(result);
        }),
        update: provider.attachContexts(value => {
          provider.withValue(A, value);
          provider.withValue(B, value);
        }),
      };
    });

    expect(api.getResult()).toEqual(2);
    expect(A).toHaveBeenCalledTimes(1);
    expect(B).toHaveBeenCalledTimes(1);

    expect(api.getResult()).toEqual(2);
    expect(A).toHaveBeenCalledTimes(1);
    expect(B).toHaveBeenCalledTimes(1);

    api.update(1);
    expect(api.getResult()).toEqual(4);
    expect(A).toHaveBeenCalledTimes(2);
    expect(B).toHaveBeenCalledTimes(2);
  });

  it('should work correct with nested context deps', () => {
    // A -> B -> C -> D

    const provider = createProvider();

    const A = jest.fn((value = 'def') => {
      return `A:${value}`;
    });

    const B = jest.fn((value = 'def') => {
      const AValue = provider.withContext(A);
      return `${AValue}_B:${value}`;
    });

    const C = jest.fn((value = 'def') => {
      const BValue = provider.withContext(B);
      return `${BValue}_C:${value}`;
    });

    const D = jest.fn((value = 'def') => {
      const CValue = provider.withContext(C);
      return `${CValue}_D:${value}`;
    });

    const api = provider.withProvider(() => {
      return {
        update: provider.attachContexts((context, value) => {
          provider.withValue(context, value);
        }),
        getValue: provider.attachContexts(() => {
          return provider.withContext(D);
        }),
      };
    });

    expect(api.getValue()).toEqual('A:def_B:def_C:def_D:def');
    api.update(A, 'custom');
    expect(api.getValue()).toEqual('A:custom_B:def_C:def_D:def');
    expect(A).toHaveBeenCalled();
    expect(B).toHaveBeenCalled();
    expect(C).toHaveBeenCalled();
    expect(D).toHaveBeenCalled();
  });

  it('should rebuild only affected contexts', () => {
    const provider = createProvider();

    const A = jest.fn((value = 'def') => {
      return `A:${value}`;
    });

    const B = jest.fn((value = 'def') => {
      const AValue = provider.withContext(A);
      return `${AValue}_B:${value}`;
    });

    const C = jest.fn((value = 'def') => {
      const BValue = provider.withContext(B);
      return `${BValue}_C:${value}`;
    });

    const D = jest.fn((value = 'def') => {
      const CValue = provider.withContext(C);
      return `${CValue}_D:${value}`;
    });

    const api = provider.withProvider(() => {
      return {
        update: provider.attachContexts((context, value) => {
          provider.withValue(context, value);
        }),
        getValue: provider.attachContexts(() => {
          return provider.withContext(D);
        }),
      };
    });

    expect(api.getValue()).toEqual('A:def_B:def_C:def_D:def');
    api.update(C, 'custom');
    expect(api.getValue()).toEqual('A:def_B:def_C:custom_D:def');
    expect(A).toHaveBeenCalledTimes(1);
    expect(B).toHaveBeenCalledTimes(1);
    expect(C).toHaveBeenCalledTimes(2);
    expect(D).toHaveBeenCalledTimes(2);
  });

  it('should work correct with cycle deps', () => {
    const provider = createProvider();

    const A = () => {
      provider.withContext(B);
      return 'A';
    };

    const B = () => {
      provider.withContext(A);
      return 'B';
    };

    const C = () => {
      provider.withContext(A);
      return 'C';
    };

    const api = provider.withProvider(() => {
      return {
        update: provider.attachContexts((context, value) => {
          provider.withValue(context, value);
        }),
        getValue: provider.attachContexts(() => {
          return provider.withContext(C);
        }),
      };
    });

    expect(() => api.getValue()).toThrow();
  });
});
