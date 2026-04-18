import { t } from 'try';
import { Temporal } from 'temporal-polyfill';
import { loadDataFile } from '../core/load-data-file.ts';
import { requireArg } from '../core/require-arg.ts';
import type { DockyardModRegistry } from '../types/generated.ts';

const registryPath = requireArg(process.argv[2], '<registry-path>');

const isValidDate = (date: string): boolean => t(() => Temporal.PlainDate.from(date)).ok;

const registryResult = await t(() => loadDataFile(registryPath));

if (!registryResult.ok) {
  console.error('Unable to load registry.');
  console.error(registryResult.error);
  process.exit(1);
}

const registry = registryResult.value as DockyardModRegistry;
const seenIds = new Set<string>();
const seenRepos = new Set<string>();

for (const mod of registry.mods) {
  if (seenIds.has(mod.id)) {
    console.error('Duplicate mod id found.');
    console.error(mod.id);
    process.exit(1);
  }

  seenIds.add(mod.id);

  if (seenRepos.has(mod.repo)) {
    console.error('Duplicate repo URL found.');
    console.error(mod.repo);
    process.exit(1);
  }

  seenRepos.add(mod.repo);

  if (mod.certification && !isValidDate(mod.certification.expiresAt)) {
    console.error('Certification expiration date is not valid.');
    console.error(mod.certification.expiresAt);
    process.exit(1);
  }
}

console.log('Registry content validation passed.');
