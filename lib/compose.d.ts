import React from 'react';
export interface MiddlewareProps {
    next: (props: any) => React.ReactElement | null;
}
export default function compose<P extends MiddlewareProps>(widgets: React.ComponentType<P>[]): React.ComponentType<P>;
