export const requireArg = (value: string | undefined, flagName: string): string => {
  if (!value) {
    throw new Error(`Missing required argument: ${flagName}`);
  }

  return value;
};
