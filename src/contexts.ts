import {
  IContextsMap,
  IContextsSet,
  IContextsValuesMap,
  IProvider,
  IContextFactory,
} from './contexts.types';

import { CallInProgress, CallNotInProgress } from './errors';

export function createProvider(): IProvider {
  const contexts: IContextsSet = new Set();

  let values: IContextsValuesMap = new Map();
  let local: Record<number, IContextsMap> = {};
  let dependencies = new Map<IContextFactory, Set<IContextFactory>>();

  let usedContextsStack: Set<IContextFactory>[] = [];
  let usedContexts = new Set<IContextFactory>();

  let inProgress = false;
  let k = 0;

  let isAttachCalled = false;

  function buildContext(context: IContextFactory) {
    let value;
    if (values.has(context)) {
      value = values.get(context);
    }

    usedContextsStack.push(usedContexts);
    usedContexts = new Set();

    const instance = context.factory(value);

    dependencies.set(context, usedContexts);
    usedContexts = usedContextsStack.pop();

    return instance;
  }

  function rebuildContextDependencies(context: IContextFactory) {
    if (!local[k].has(context)) {
      return;
    }

    local[k].delete(context);

    dependencies.forEach((dependencies, dependent) => {
      if (dependencies.has(context)) {
        rebuildContextDependencies(dependent);
      }
    });
  }

  return {
    attach(main) {
      let boundK = k;
      isAttachCalled = true;

      return (...args) => {
        let prev = k;
        k = boundK;
        inProgress = true;

        const response = main(...args);
        inProgress = false;
        k = prev;

        return response;
      };
    },

    createContext(factory) {
      if (inProgress) {
        throw new CallInProgress('createContext(factory)');
      }

      const context = { factory };

      contexts.add(context);

      return context;
    },

    duplicateContext(context) {
      const dup = this.createContext(context.factory);
      return dup;
    },

    withValue: (context, value) => {
      values.set(context, value);

      if (inProgress) {
        rebuildContextDependencies(context);
      }
    },

    withContexts(main) {
      k++;

      if (inProgress) {
        throw new CallInProgress('withContexts(main)');
      }

      inProgress = true;

      local[k] = new Map();

      const result = main();

      if (!isAttachCalled) {
        delete local[k];
      }

      inProgress = false;
      isAttachCalled = false;

      return result;
    },

    useContext(context) {
      if (!inProgress) {
        throw new CallNotInProgress('useContext(context)');
      }

      if (!local[k]) {
        throw new Error(
          `Wrong context "${k}" identifier. This seems to be a bug. Please report`
        );
      }

      if (local[k].has(context)) {
        return local[k].get(context);
      }

      if (!contexts.has(context)) {
        throw new Error(`Context does not registered with "createContext`);
      }

      usedContexts.add(context);

      const instance = buildContext(context);
      local[k].set(context, instance);

      return local[k].get(context);
    },
  };
}
