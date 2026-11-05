export const normalizeDate = (value: unknown): Date => {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error("Invalid date value.");
    }
    return value;
  }

  if (typeof value !== "string" || !value.trim()) {
    throw new Error("A valid date is required.");
  }

  const input = value.trim();

  let parsed: Date;

  // Convert YYYY-MM-DD into an explicit UTC DateTime.
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    parsed = new Date(`${input}T00:00:00.000Z`);

    // Reject impossible calendar dates.
    if (parsed.toISOString().slice(0, 10) !== input) {
      throw new Error("Invalid calendar date.");
    }
  } else {
    parsed = new Date(input);
  }

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date format.");
  }

  return parsed;
};
