import React from 'react';

export interface MiddlewareProps {
  next: (props: any) => React.ReactElement | null;
}

export default function compose<P extends MiddlewareProps>(widgets: React.ComponentType<P>[]): React.FC<P> {
  const Composed: React.FC<P> = (props) => {
    const dispatch: (nextProp: P, i: number) => React.ReactElement | null = (nextProps, i) => {
      const Widget = widgets[i];
      if (i >= widgets.length) return props.next ? props.next(nextProps) : null;
      const pp: P = {
        ...nextProps,
        next: (_props: P) => dispatch(_props, i + 1),
      };
      return <Widget {...pp} />;
    };
    return dispatch(props, 0);
  };
  return Composed;
}
