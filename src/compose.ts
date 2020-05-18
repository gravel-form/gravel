export interface Middleware<U extends unknown[], R> {
  (next: (...args: U) => R, ...args: U): R;
}

export function compose<U extends unknown[], R>(middlewares: (Middleware<U, R>)[]): Middleware<U, R> {
  const composed: Middleware<U, R> = (next, ...args) => {
    const dispatch: (i: number, ...args: U) => R = (i, ...nextArgs) => {
      const middleware = middlewares[i];
      if (i >= middlewares.length) return next(...nextArgs);
      return middleware((...args) => dispatch(i + 1, ...args), ...args);
    };
    return dispatch(0, ...args);
  };
  return composed;
}
