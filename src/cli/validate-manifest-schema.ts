import { t } from 'try';
import { createAjv } from '../core/ajv.ts';
import { loadDataFile } from '../core/load-data-file.ts';
import { loadJsonSchema } from '../core/load-json-schema.ts';
import { printAjvErrors } from '../core/print-ajv-errors.ts';
import { requireArg } from '../core/require-arg.ts';
import type { DockyardModManifest } from '../types/generated.ts';

const manifestPath = requireArg(process.argv[2], '<manifest-path>');
const explicitSchemaLocation = process.argv[3];

const manifestResult = await t(() => loadDataFile(manifestPath));

if (!manifestResult.ok) {
  console.error('Unable to load manifest.');
  console.error(manifestResult.error);
  process.exit(1);
}

const manifestValue = manifestResult.value;
const schemaFromDocument =
  typeof manifestValue === 'object' &&
  manifestValue !== null &&
  '$schema' in manifestValue &&
  typeof manifestValue.$schema === 'string'
    ? manifestValue.$schema
    : undefined;

const schemaLocation = explicitSchemaLocation ?? schemaFromDocument;

if (!schemaLocation) {
  console.error(
    'No manifest schema location provided. Pass one explicitly or include $schema in the manifest.',
  );
  process.exit(1);
}

const schemaResult = await t(() => loadJsonSchema(schemaLocation));

if (!schemaResult.ok) {
  console.error('Unable to load manifest schema.');
  console.error(schemaResult.error);
  process.exit(1);
}

const ajv = createAjv();

const validateResult = await t(() => ajv.compileAsync(schemaResult.value));

if (!validateResult.ok) {
  console.error('Unable to compile manifest schema.');
  console.error(validateResult.error);
  process.exit(1);
}

const validate = validateResult.value;
const valid = validate(manifestValue);

if (!valid) {
  console.error('Manifest schema validation failed:');
  printAjvErrors(validate.errors);
  process.exit(1);
}

const manifest = manifestValue as DockyardModManifest;
void manifest;

console.log('Manifest schema validation passed.');
