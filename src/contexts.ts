import { IProvider, IFactory, ArgumentTypes } from './contexts.types';

type IContextsMap<T extends IFactory = IFactory> = Map<T, ReturnType<T>>;
type IContextsInitialValuesMap<T extends IFactory = IFactory> = Map<
  T,
  ArgumentTypes<T>
>;
type IUsedContexts = Set<IFactory>;
type IDependencies = Map<IFactory, IUsedContexts>;
type IWIthContextsCallStack = IUsedContexts[];

export function createProvider(): IProvider {
  const dependencies: IDependencies = new Map();
  const withContextCallStack: IWIthContextsCallStack = [];

  let contexts: IContextsMap = new Map();
  let initialValues: IContextsInitialValuesMap = new Map();
  let usedContexts: IUsedContexts = new Set();

  let inProgress = false;

  function clearContexts(factory: IFactory) {
    contexts.delete(factory);

    dependencies.forEach((dependencies, dependent) => {
      if (dependencies.has(factory)) {
        clearContexts(dependent);
      }
    });
  }

  function createContext<T extends IFactory>(
    factory: T,
    ...value: ArgumentTypes<T>
  ) {
    checkCycleDeps(factory);

    const usedContextsBackup = usedContexts;
    withContextCallStack.push(usedContexts);

    usedContexts = new Set();

    contexts.set(factory, factory(...value));

    dependencies.set(factory, usedContexts);
    usedContexts = usedContextsBackup;
    withContextCallStack.pop();
  }

  function checkCycleDeps(factory: IFactory) {
    let breadcrumbs = [];

    let hasCycle = false;
    withContextCallStack.forEach(usedContexts => {
      if (usedContexts.has(factory)) {
        hasCycle = true;
      }
      breadcrumbs.push(
        [...usedContexts].map(c => (c === factory ? `|${c.name}|` : c.name))
      );
    });

    if (hasCycle) {
      breadcrumbs.push(`|${factory.name}|`);
      throw new Error(`
There are cycle context dependencies:
${breadcrumbs.join(' -> ')}
`);
    }
  }

  return {
    withProvider(main: Function) {
      if (inProgress) {
        throw new Error(
          'Could not run "withProvider" while another "withProvider" is still in progress progress.'
        );
      }

      contexts = new Map();

      inProgress = true;
      const result = main();

      if (result && result.then) {
        Promise.resolve(result).then(() => {
          inProgress = false;
        });
      } else {
        inProgress = false;
      }

      return result;
    },
    attachContexts(main: Function) {
      if (!inProgress) {
        throw new Error(
          '"attachContexts" should be used inside "withProvider" and while it is in progress progress or attached to contexts using "withContexts".'
        );
      }

      let localContexts = contexts;

      return (...args) => {
        inProgress = true;

        const contextsBackup = contexts;
        contexts = localContexts;

        const result = main(...args);

        contexts = contextsBackup;
        inProgress = false;

        return result;
      };
    },
    withContext(factory) {
      if (!inProgress) {
        throw new Error(
          '"withContext" should be used inside "withProvider" or "attachContexts"'
        );
      }

      usedContexts.add(factory);

      if (!contexts.has(factory)) {
        const value = initialValues.get(factory) || [];
        // @ts-ignore
        createContext(factory, ...value);
      }

      return contexts.get(factory);
    },

    duplicateContext(factory) {
      return (...args) => {
        return factory(...args);
      };
    },

    withValue(factory, ...value) {
      initialValues.set(factory, value);
      clearContexts(factory);
    },

    // ---
    createScope(factory, ...values) {
      return (main: Function) => {
        if (inProgress) {
          throw new Error(
            'Functions created with "createScope" should be used inside "withProvider" and while it is in progress or attached to contexts using "withContexts".'
          );
        }

        const instance = contexts.get(factory);

        createContext(factory, ...values);
        const result = main();
        clearContexts(factory);

        if (instance) {
          contexts.set(factory, instance);
        }

        return result;
      };
    },
  };
}
