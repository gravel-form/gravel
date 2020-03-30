import { JSONSchema7Definition, JSONSchema7 } from 'json-schema';

const keywords: (keyof Pick<
  JSONSchema7,
  'additionalItems' | 'items' | 'contains' | 'additionalProperties' | 'propertyNames' | 'not' | 'if' | 'then' | 'else'
>)[] = ['additionalItems', 'items', 'contains', 'additionalProperties', 'propertyNames', 'not', 'if', 'then', 'else'];

const arrayKeywords: (keyof Pick<JSONSchema7, 'items' | 'allOf' | 'anyOf' | 'oneOf'>)[] = [
  'items',
  'allOf',
  'anyOf',
  'oneOf',
];

const propsKeywords: (keyof Pick<
  JSONSchema7,
  'definitions' | 'properties' | 'patternProperties' | 'dependencies'
>)[] = ['definitions', 'properties', 'patternProperties', 'dependencies'];

function parseLocalJSONPointer(pointer: string): string[] {
  return pointer
    .slice(2)
    .split('/')
    .map((str) => {
      return decodeURIComponent(str)
        .replace(/~1/g, '/')
        .replace(/~0/g, '~');
    });
}

function _getSchema(schema: JSONSchema7, path: string[]): JSONSchema7Definition | null {
  let _schema: JSONSchema7Definition | undefined;
  let next: JSONSchema7Definition | undefined = schema;
  let i = 0;
  while (i < path.length) {
    _schema = next;
    next = undefined;
    if (!_schema || typeof _schema !== 'object') return null;
    for (const key of propsKeywords) {
      if (key !== path[i]) continue;

      const sch: { [key: string]: JSONSchema7Definition | string[] } | undefined = _schema[key];
      if (!sch || typeof sch !== 'object') return null;
      const _next: JSONSchema7Definition | string[] = sch[path[i + 1]];
      if (Array.isArray(_next)) break;
      next = _next;
      i += 2;
    }
    if (next) continue;

    for (const key of arrayKeywords) {
      if (key !== path[i]) continue;
      const sch: JSONSchema7Definition[] | JSONSchema7Definition | undefined = _schema[key];
      if (!Array.isArray(sch)) break;
      next = sch[+path[i + 2]];
      i += 2;
    }
    if (next) continue;

    for (const key of keywords) {
      if (key !== path[i]) continue;
      const sch: JSONSchema7Definition[] | JSONSchema7Definition | undefined = _schema[key];
      if (!sch || Array.isArray(sch)) return null;
      next = sch;
      i += 1;
    }
  }

  return next || null;
}

export function getSchemaByPointer(
  schema: JSONSchema7,
  jsonPointer: string
): { schema: JSONSchema7Definition; path: string[] } | null {
  const path = parseLocalJSONPointer(jsonPointer);
  const sch = _getSchema(schema, path);

  return sch ? { schema: sch, path } : null;
}

function* _traverse(
  schema: JSONSchema7Definition,
  path: (string | number)[]
): Generator<{ schema: JSONSchema7; path: (string | number)[] }, void, void> {
  if (schema && typeof schema === 'object' && !Array.isArray(schema)) {
    yield { schema, path };
    for (const key of propsKeywords) {
      const sch: { [key: string]: JSONSchema7Definition | string[] } | undefined = schema[key];
      if (sch && typeof sch == 'object') {
        for (const prop in sch) {
          const child = sch[prop];
          if (Array.isArray(child) || typeof child !== 'object') continue;
          yield* _traverse(child, [...path, key, prop]);
        }
      }
    }

    for (const key of arrayKeywords) {
      const sch: JSONSchema7Definition[] | JSONSchema7Definition | undefined = schema[key];
      if (!Array.isArray(sch)) continue;
      for (const i in sch) {
        yield* _traverse(sch[i], [...path, key, i]);
      }
    }

    for (const key of keywords) {
      const sch: JSONSchema7Definition[] | JSONSchema7Definition | undefined = schema[key];
      if (!sch || Array.isArray(sch)) continue;
      yield* _traverse(sch, [...path, key]);
    }
  }
}

export function* traverse(
  schema: JSONSchema7
): Generator<{ schema: JSONSchema7; path: (string | number)[] }, void, void> {
  yield* _traverse(schema, []);
}

export default traverse;
