import { createProvider } from './contexts';

export * from './contexts.types';

const {
  withContexts,
  withValue,
  useContext,
  createContext,
  attach,
} = createProvider();

export { createProvider } from './contexts';
export { withContexts, withValue, useContext, createContext, attach };
