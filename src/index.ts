import { createProvider } from './contexts';

export * from './contexts.types';

const {
  withProvider,
  withValue,
  withContext,
  attachContexts,
  createScope,
} = createProvider();

export { createProvider } from './contexts';
export { withProvider, withValue, withContext, attachContexts, createScope };
