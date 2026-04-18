import type { AnySchemaObject } from 'ajv';
import { loadText } from './load-text.ts';

export const loadJsonSchema = async (location: string): Promise<AnySchemaObject> => {
  const text = await loadText(location);
  return JSON.parse(text) as AnySchemaObject;
};
