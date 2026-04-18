import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { AnySchemaObject } from 'ajv';

export const createAjv = () => {
  const ajv = new Ajv.Ajv({
    allErrors: true,
    strict: true,
    loadSchema: async (uri: string): Promise<AnySchemaObject> => {
      const response = await fetch(uri);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch schema "${uri}": ${response.status} ${response.statusText}`,
        );
      }

      return (await response.json()) as AnySchemaObject;
    },
  });

  addFormats.default(ajv);
  return ajv;
};
