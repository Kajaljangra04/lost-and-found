type ErrorShape = {
  data?: { message?: string };
  message?: string;
};

/**
 * Extracts a human-readable message from an unknown error value.
 * Handles the `{ data: { message } }` shape returned by RTK Query,
 * plain `Error` instances, and falls back to a caller-provided default.
 */
export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string => {
  if (!error) return fallback;

  if (typeof error === "object") {
    const shape = error as ErrorShape;
    if (shape?.data?.message) return shape.data.message;
    if (shape?.message) return shape.message;
  }

  if (error instanceof Error && error.message) return error.message;

  return fallback;
};