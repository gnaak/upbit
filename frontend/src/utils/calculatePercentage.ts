const calculatePercentage = (
  highest: { high: number } | null,
  lowest: { low: number } | null,
  current: number | null,
) => {
  if (!highest || !lowest || current == null) {
    return { highestPercentage: null, lowestPercentage: null };
  }

  const highestPercentage = (
    -((highest.high - current) / current) * 100
  ).toFixed(3);
  const lowestPercentage = (((lowest.low - current) / current) * -100).toFixed(
    3,
  );

  return { highestPercentage, lowestPercentage };
};

export default calculatePercentage;
