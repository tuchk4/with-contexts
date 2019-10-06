import * as Types from './types';

export function createContext<T extends Types.IFunction = Types.IFunction>(
  factory: T
): Types.IContext<T> {
  let isProviderCalled = false;

  const stack: Types.IContainer[] = [];
  let container: Types.IContainer<T> = null;

  function withProxy(target: any, container: Types.IContainer<T>) {
    if (
      !target ||
      (typeof target !== 'object' && typeof target !== 'function')
    ) {
      return target;
    }

    if (target.then) {
      return target.then((result: any) => withProxy(result, container));
    }

    return new Proxy(target, {
      apply: function(target, _, args) {
        const attached = attachContext(target, container);
        return attached(...args);
      },
      get: function(target, name) {
        const value = target[name];

        if (typeof value === 'function') {
          return attachContext(value, container);
        } else if (typeof value === 'object') {
          return withProxy(value, container);
        }

        return value;
      },
    });
  }

  const attachContext = (
    func: Types.IFunction,
    local: Types.IContainer<T>
  ): ReturnType<Types.IAttachContext> => {
    return (...args) => {
      if (container && container.inProgress) {
        throw new Error('note');
      }

      const backup = container;
      container = local;
      const result = runInsideProvider(func, args);

      return whenResolved(result, () => {
        container = backup;
      });
    };
  };

  function whenResolved(response, func) {
    if (response && response.then) {
      return response
        .then(response => {
          func();
          return response;
        })
        .catch(error => {
          func();
          throw error;
        });
    } else {
      func();
      return response;
    }
  }

  function runInsideProvider(func, args = []) {
    container.inProgress = true;
    const result = withProxy(func(...args), container);
    container.inProgress = false;

    return whenResolved(result, () => {
      // container.inProgress = false;
    });
  }

  function startContainer() {
    stack.push(container);
    container = { inProgress: true };
  }

  function finishContainer() {
    container = stack.pop();
  }

  return {
    replaceFactory(newFactory) {
      if (isProviderCalled) {
        throw new Error(
          'It is not possible to replace factory if Provider has been already called.'
        );
      }

      factory = newFactory;
    },
    attach(func) {
      if (!container.inProgress) {
        throw new Error(
          'It is not possible to attach outside of Provider call.'
        );
      }

      return attachContext(func, container);
    },
    Provider: main => {
      isProviderCalled = true;
      startContainer();
      const result = runInsideProvider(main);

      return whenResolved(result, () => {
        finishContainer();
      });
    },

    Consumer() {
      if (!container) {
        // || !container.inProgress) {
        throw new Error(
          'Consumer called out of Provider and function is not attached. Also may get this error if call Consumer after async operations'
        );
      }

      if (!container.hasOwnProperty('instance')) {
        container.instance = factory();
      }

      return container.instance;
    },
  };
}
