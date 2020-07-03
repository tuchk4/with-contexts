import * as Types from './types';

export function composeContexts(...contexts: Types.IContext[]) {
  return (main: Types.IFunction) => {
    const withProviders = contexts.reduce<Types.IFunction>((acc, context) => {
      return () => context.Provider(acc);
    }, main);

    return withProviders();
  };
}
