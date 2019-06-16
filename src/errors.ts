export class CallInProgress extends Error {
  constructor(sig: string) {
    super(`
  It is not possible to call "${sig}" function while "withContexts" is in progress.
`);

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class CallNotInProgress extends Error {
  constructor(sig: string) {
    super(`
  It is not possible to call "${sig}" function while "withContexts" is NOT in progress.
  This may happens when:
    - function "${sig}" called after async operations during "withContexts" run.
    - "withContexts" returns functions that use "useContext". In this case wrap such functions with "attachContext"
`);

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
