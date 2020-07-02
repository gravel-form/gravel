import * as React from 'react';
import { MiddlewareProps } from './types';

export interface ExtraPropsMiddlewareProps<P extends ExtraPropsFormProps = ExtraPropsFormProps>
  extends MiddlewareProps<P> {
  extraProps?: any;
}

export interface ExtraPropsFormProps {
  extraProps?: any;
}

export function withName<P extends ExtraPropsMiddlewareProps>(
  Component: React.ComponentType<P>,
  name?: string,
  field: string = 'component'
): React.FC<P> {
  return (props: P) => {
    const extraProps = props.extraProps;
    if ((extraProps && extraProps[field]) !== name) return props.next(props);
    return <Component {...props} />;
  };
}

export const ExtraPropsMw: React.ComponentType<ExtraPropsMiddlewareProps> = (props) => {
  const {
    next,
    schemaPath,
    formProps: { extraProps },
  } = props;

  const ep = React.useMemo(() => {
    if (!schemaPath.length) return extraProps;
    let node = extraProps;
    for (const field of schemaPath) {
      if (!node) break;
      node = node[field];
    }
    return node;
  }, [schemaPath, extraProps]);

  return ep === props.extraProps ? next(props) : next({ ...props, extraProps: ep });
};
