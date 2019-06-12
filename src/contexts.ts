import {
  IContextsMap,
  IContextsSet,
  IContextsValuesMap,
  IProvider,
} from './context.types';

import { CallInProgress, CallNotInProgress } from './errors';

export function createProvider(): IProvider {
  const contexts: IContextsSet = new Set();

  let values: IContextsValuesMap = new Map();
  let local: IContextsMap = new Map();

  let inProgress = false;

  return {
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
      if (inProgress) {
        throw new CallInProgress('withValue(context, value)');
      }

      values.set(context, value);
    },

    withContexts(main) {
      if (inProgress) {
        throw new CallInProgress('withContexts(main)');
      }

      inProgress = true;

      local = new Map();
      contexts.forEach(context => {
        let value;
        if (values.has(context)) {
          value = values.get(context);
        }
        local.set(context, context.factory(value));
      });

      const result = main();
      inProgress = false;
      return result;
    },

    useContext(context) {
      if (!inProgress) {
        throw new CallNotInProgress('useContext(context)');
      }

      return local.get(context);
    },
  };
}
