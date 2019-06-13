// type ArgumentType<F extends Function> = F extends (a: infer A) => any
//   ? A
//   : never;

type ArgumentTypes<T extends (...args: any[]) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

export type IFactory<T, D> = (value?: D) => T;

export interface IContextFactory<T = any, D = any> {
  factory: IFactory<T, D>;
}

export type IContextsSet = Set<IContextFactory>;
export type IContextsMap = Map<
  IContextFactory,
  ReturnType<IContextFactory['factory']>
>;
export type IContextsValuesMap<T = any> = Map<IContextFactory<T>, T>;

export interface IProvider {
  attach<T extends (...args: any[]) => any>(
    f: T
  ): (...args: ArgumentTypes<T>) => ReturnType<T>;

  withContexts<T = any>(main: Function): T;

  useContext<T extends IContextFactory = IContextFactory>(
    context: T
  ): ReturnType<T['factory']>;

  createContext<T = any, D = any>(
    factory: IFactory<T, D>
  ): IContextFactory<T, D>;

  duplicateContext(context: IContextFactory): IContextFactory;

  withValue<T extends IContextFactory = IContextFactory>(
    context: T,
    value: ArgumentTypes<T['factory']>[0]
  ): void;
}
