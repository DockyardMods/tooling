import { t } from 'try';
import { createAjv } from '../core/ajv.ts';
import { loadDataFile } from '../core/load-data-file.ts';
import { loadJsonSchema } from '../core/load-json-schema.ts';
import { printAjvErrors } from '../core/print-ajv-errors.ts';
import { requireArg } from '../core/require-arg.ts';
import type { DockyardModRegistry } from '../types/generated.ts';

const registryPath = requireArg(process.argv[2], '<registry-path>');
const schemaLocation = requireArg(process.argv[3], '<registry-schema-path-or-url>');

const registryResult = await t(() => loadDataFile(registryPath));

if (!registryResult.ok) {
  console.error('Unable to load registry.');
  console.error(registryResult.error);
  process.exit(1);
}

const schemaResult = await t(() => loadJsonSchema(schemaLocation));

if (!schemaResult.ok) {
  console.error('Unable to load registry schema.');
  console.error(schemaResult.error);
  process.exit(1);
}

const ajv = createAjv();

const validateResult = await t(() => ajv.compileAsync(schemaResult.value));

if (!validateResult.ok) {
  console.error('Unable to compile registry schema.');
  console.error(validateResult.error);
  process.exit(1);
}

const validate = validateResult.value;
const valid = validate(registryResult.value);

if (!valid) {
  console.error('Registry schema validation failed:');
  printAjvErrors(validate.errors);
  process.exit(1);
}

const registry = registryResult.value as DockyardModRegistry;
void registry;

console.log('Registry schema validation passed.');
