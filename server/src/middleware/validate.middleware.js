// Validation Middleware
// Generic Zod schema validator — wraps any Zod schema into Express middleware

/**
 * Creates an Express middleware that validates the request
 * against the provided Zod schema.
 *
 * @param {import("zod").ZodObject} schema - Zod schema with optional body, params, query keys
 * @returns {import("express").RequestHandler} Express middleware
 *
 * @example
 * // In a route file:
 * import { validate } from "../middleware/validate.middleware.js";
 * import { createUserSchema } from "../validators/user.validator.js";
 * router.post("/users", validate(createUserSchema), userController.create);
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    // Only replace body (params and query may be read-only in Express v5)
    if (result.data.body) {
      req.body = result.data.body;
    }

    next();
  };
}
