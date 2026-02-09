const currentYear = new Date().getFullYear();

export const yearOptions = Array.from({ length: currentYear - 2023 }, (_, i) => {
  const year = 2024 + i;
  return { value: year.toString(), label: year.toString() };
});
