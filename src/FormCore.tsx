import * as React from 'react';
import { FormProps } from './types';
import { composeRC, Null } from './utils';

const noop = () => {};

export const FormCore: React.FC<FormProps> = (props) => {
  const { schema, data, middlewares, onChange } = props;
  if (!middlewares || !schema) return null;
  const Composed = React.useMemo(() => (Array.isArray(middlewares) ? composeRC(middlewares) : middlewares), [
    middlewares,
  ]);
  return (
    <Composed
      schema={schema}
      onChange={onChange || noop}
      data={data}
      schemaPath={[]}
      dataPath={[]}
      parent={null}
      next={Null}
      MiddlewareComponent={Composed}
      formProps={props}
    />
  );
};
