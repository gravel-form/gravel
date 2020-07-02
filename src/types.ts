import { JSONSchema7Definition, JSONSchema7 } from 'json-schema';

export interface GenericMiddlewareProps {
  next: (props: any) => React.ReactElement | null;
}

export interface MiddlewareProps<FP = {}> extends GenericMiddlewareProps {
  schema: JSONSchema7Definition;
  parent: MiddlewareProps | null;
  data: unknown;
  onChange: Function;
  schemaPath: (string | number)[];
  dataPath: (string | number)[];
  MiddlewareComponent: React.ComponentType<MiddlewareProps>;
  formProps: FormProps & FP;
}

export interface FormProps {
  schema: JSONSchema7;
  middlewares: React.ComponentType<MiddlewareProps> | React.ComponentType<MiddlewareProps>[];
  data?: unknown;
  onChange?: (data: unknown) => void;
}
