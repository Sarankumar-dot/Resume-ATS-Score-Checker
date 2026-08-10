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
    try {
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

      // Replace req data with parsed (and potentially transformed) values
      req.body = result.data.body ?? req.body;
      req.params = result.data.params ?? req.params;
      req.query = result.data.query ?? req.query;

      next();
    } catch (error) {
      return res.status(500).json({ error: "Internal validation error" });
    }
  };
}
