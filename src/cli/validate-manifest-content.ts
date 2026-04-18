import { t } from 'try';
import { loadDataFile } from '../core/load-data-file.ts';
import { requireArg } from '../core/require-arg.ts';
import type { DockyardModManifest } from '../types/generated.ts';

const manifestPath = requireArg(process.argv[2], '<manifest-path>');

const manifestResult = await t(() => loadDataFile(manifestPath));

if (!manifestResult.ok) {
  console.error('Unable to load manifest.');
  console.error(manifestResult.error);
  process.exit(1);
}

const manifest = manifestResult.value as DockyardModManifest;

const dependencyIds = new Set<string>();

for (const dependency of manifest.dependencies ?? []) {
  if (dependencyIds.has(dependency.id)) {
    console.error('Duplicate dependency id found.');
    console.error(dependency.id);
    process.exit(1);
  }

  dependencyIds.add(dependency.id);
}

const mediaPaths = new Set<string>();

for (const item of manifest.media ?? []) {
  if (mediaPaths.has(item.path)) {
    console.error('Duplicate media path found.');
    console.error(item.path);
    process.exit(1);
  }

  mediaPaths.add(item.path);

  if (item.type === 'image' && 'thumbnailPath' in item && item.thumbnailPath) {
    console.error('Image media entries must not define thumbnailPath.');
    console.error(item.path);
    process.exit(1);
  }
}

const packageUrls = new Set<string>();

for (const pkg of manifest.packages) {
  if (packageUrls.has(pkg.url)) {
    console.error('Duplicate package URL found.');
    console.error(pkg.url);
    process.exit(1);
  }

  packageUrls.add(pkg.url);
}

console.log('Manifest content validation passed.');
