// Health Service
// Contains the business logic for the health-check endpoint.
// Services are framework-agnostic — no req/res objects here.

/**
 * Returns the application health status.
 * @returns {{ status: string, timestamp: string }} Health status object
 */
export function getHealthStatus() {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
}
