export const loadText = async (location: string): Promise<string> => {
  if (URL.canParse(location)) {
    const response = await fetch(location);

    if (!response.ok) {
      throw new Error(`Failed to fetch "${location}": ${response.status} ${response.statusText}`);
    }

    return await response.text();
  }

  return await Bun.file(location).text();
};
