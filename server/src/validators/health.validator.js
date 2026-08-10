// Health Validator
// Placeholder — the health-check route has no input to validate,
// but this file demonstrates where Zod schemas live.

import { z } from "zod";

// Example: if the health route accepted query params, the schema would go here.
// For now, this is a no-op placeholder to show the pattern.
export const healthQuerySchema = z.object({
  query: z
    .object({
      verbose: z.string().optional(),
    })
    .optional(),
});
