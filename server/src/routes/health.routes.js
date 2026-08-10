// Health Routes
// Defines the /health endpoint — no logic here, just wiring.
// Swagger JSDoc annotations for API documentation.

import { Router } from "express";
import { checkHealth } from "../controllers/health.controller.js";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns the health status of the API. This is a public endpoint — no authentication required.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-01T00:00:00.000Z"
 */
router.get("/health", checkHealth);

export default router;
