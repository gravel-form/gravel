import { JSONSchema7Definition, JSONSchema7 } from 'json-schema';

export interface SchemaLocalRef {
  schema: JSONSchema7Definition;
  path: (string | number)[];
}

export interface MiddlewareProps {
  next: (props: any) => React.ReactElement | null;
}

export interface FormMiddlewareProps<FP = {}> extends MiddlewareProps {
  schema: JSONSchema7Definition;
  parent: FormMiddlewareProps | null;
  data: unknown;
  onChange: Function;
  schemaPath: (string | number)[];
  dataPath: (string | number)[];
  MiddlewareComponent: React.ComponentType<FormMiddlewareProps>;
  formProps: FormProps & FP;
  localRefs?: { [key: string]: SchemaLocalRef };
}

export interface FormProps {
  schema: JSONSchema7;
  middlewares: React.ComponentType<FormMiddlewareProps> | React.ComponentType<FormMiddlewareProps>[];
  data?: unknown;
  onChange?: (data: unknown) => void;
}
