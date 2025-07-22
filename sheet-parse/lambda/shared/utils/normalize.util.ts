export const formatKey = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
};

export const normalizeRow = (row: Record<string, any>): Record<string, any> => {
  const normalized: Record<string, any> = {};
  for (const key in row) {
    const newKey = formatKey(key);
    normalized[newKey] = row[key];
  }
  return normalized;
};
