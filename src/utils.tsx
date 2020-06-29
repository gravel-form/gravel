import * as React from 'react';
import { MiddlewareProps, FormMiddlewareProps } from './types';
import { compose, Middleware } from './compose';

export function adapter<P extends MiddlewareProps>(
  Middleware: React.ComponentType<P>
): Middleware<Parameters<React.FC<P>>, ReturnType<React.FC<P>>> {
  return (next, props) => React.createElement(Middleware, { ...props, next });
}

export function composeRC<P extends MiddlewareProps>(middlewares: React.ComponentType<P>[]): React.FC<P> {
  const composed = compose(middlewares.map(adapter));
  return (props: P) => composed(props.next, props);
}

export const Null: React.FC = () => null;

export function toJSONSchemaPath(dataPath: (string | number)[]): string {
  return dataPath.map((key) => (typeof key === 'number' ? `[${key}]` : '.' + key)).join('');
}

export function isRequired({ parent, dataPath }: FormMiddlewareProps): boolean {
  const field = dataPath[dataPath.length - 1];
  return !!(
    parent &&
    typeof parent.schema !== 'boolean' &&
    parent.schema.required &&
    typeof field === 'string' &&
    parent.schema.required.includes(field)
  );
}
