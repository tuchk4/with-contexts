import * as Types from './types';

export function mockContext(context: Types.IContext, mock: Types.IFunction) {
  context.replaceFactory(mock);
}
