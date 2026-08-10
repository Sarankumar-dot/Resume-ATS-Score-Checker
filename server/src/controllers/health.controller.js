// Health Controller
// Handles req/res only — calls the service and sends the response.
// No business logic or DB calls here.

import { getHealthStatus } from "../services/health.service.js";

/**
 * GET /api/health
 * Returns the health status of the API.
 */
export function checkHealth(req, res) {
  const result = getHealthStatus();
  return res.status(200).json(result);
}
