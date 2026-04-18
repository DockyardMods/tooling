import { t } from 'try';
import { compile } from 'json-schema-to-typescript';
import $RefParser from '@apidevtools/json-schema-ref-parser';

type SchemaTarget = {
  name: string;
  source: string;
};

type CompileSchema = Parameters<typeof compile>[0];

const OUTPUT_PATH = process.argv[2] ?? './src/types/generated.ts';

const SCHEMA_BASE =
  process.env.DOCKYARD_SCHEMA_BASE ??
  'https://raw.githubusercontent.com/DockyardMods/the-dockyard/main/schemas';

const SCHEMAS: SchemaTarget[] = [
  {
    name: 'Registry',
    source: `${SCHEMA_BASE}/registry.schema.json`,
  },
  {
    name: 'ModManifest',
    source: `${SCHEMA_BASE}/mod-manifest.schema.json`,
  },
];

const compileSchema = async (target: SchemaTarget): Promise<string> => {
  const parser = new $RefParser();
  const dereferenced = await parser.dereference(target.source);

  return await compile(dereferenced as CompileSchema, target.name, {
    additionalProperties: false,
    bannerComment:
      '/* eslint-disable */\n' +
      '/**\n' +
      ' * This file is auto-generated.\n' +
      ' * Do not edit it by hand.\n' +
      ' */',
    format: false,
    unreachableDefinitions: true,
    strictIndexSignatures: true,
  });
};

const parts: string[] = [];

for (const target of SCHEMAS) {
  const result = await t(() => compileSchema(target));

  if (!result.ok) {
    console.error(`Unable to generate types for ${target.name}.`);
    console.error(result.error);
    process.exit(1);
  }

  parts.push(result.value.trim());
}

const output = `${parts.join('\n\n')}\n`;

const writeResult = await t(() => Bun.write(OUTPUT_PATH, output));

if (!writeResult.ok) {
  console.error('Unable to write generated types file.');
  console.error(writeResult.error);
  process.exit(1);
}

console.log(`Generated types written to ${OUTPUT_PATH}`);
