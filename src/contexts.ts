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

  let inProgress = false;

  let k = 0;

  let isAttachCalled = false;
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
      if (inProgress) {
        throw new CallInProgress('withValue(context, value)');
      }

      values.set(context, value);
    },

    withContexts(main) {
      k++;

      if (inProgress) {
        throw new CallInProgress('withContexts(main)');
      }

      inProgress = true;

      local[k] = new Map();

      // contexts.forEach(context => {
      //   let value;
      //   if (values.has(context)) {
      //     value = values.get(context);
      //   }
      //   local[k].set(context, context.factory(value));
      // });

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
        throw new Error(`Wrong current "${k}" context`);
      }

      if (local[k].has(context)) {
        return local[k].get(context);
      }

      if (!contexts.has(context)) {
        throw new Error(`Context does not registered with "createContext`);
      }

      let value;
      if (values.has(context)) {
        value = values.get(context);
      }

      local[k].set(context, context.factory(value));

      return local[k].get(context);
    },
  };
}
