import { loadText } from './load-text.ts';

export const loadDataFile = async (location: string): Promise<unknown> => {
  const text = await loadText(location);
  const lower = location.toLowerCase();

  if (lower.endsWith('.yaml') || lower.endsWith('.yml')) {
    return Bun.YAML.parse(text);
  }

  return JSON.parse(text) as unknown;
};
