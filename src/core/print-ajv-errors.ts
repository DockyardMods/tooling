import type { ErrorObject } from 'ajv';

export const printAjvErrors = (errors: ErrorObject[] | null | undefined): void => {
  for (const error of errors ?? []) {
    const location = error.instancePath || '/';
    const detail = error.message ?? 'Unknown validation error';
    console.error(`- ${location}: ${detail}`);
  }
};
