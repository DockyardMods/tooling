import { t } from 'try';
import { requireArg } from '../core/require-arg.ts';
import { loadDataFile } from '../core/load-data-file.ts';
import type { DockyardModRegistry } from '../types/generated.ts';

const inputPath = requireArg(process.argv[2], '<registry-path>');
const outputPath = process.argv[3] ?? inputPath;

const registryResult = await t(() => loadDataFile(inputPath));

if (!registryResult.ok) {
  console.error('Unable to load registry.');
  console.error(registryResult.error);
  process.exit(1);
}

const registry = registryResult.value as DockyardModRegistry;

registry.mods = registry.mods.toSorted((a, b) => a.id.localeCompare(b.id));

const formatted = `${JSON.stringify(registry, null, 2)}\n`;

const writeResult = await t(() => Bun.write(outputPath, formatted));

if (!writeResult.ok) {
  console.error('Unable to write formatted registry.');
  console.error(writeResult.error);
  process.exit(1);
}

console.log(`Formatted registry written to ${outputPath}`);
