import { createProvider } from './contexts';

const { withContexts, withValue, useContext, createContext } = createProvider();

export * from './contexts.types';
export { createProvider } from './contexts';
export { withContexts, withValue, useContext, createContext };
