// Express Application Entry Point

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import env from "./config/env.js";
import corsOptions from "./config/cors.js";
import swaggerSpec from "./config/swagger.js";

// Routes
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";

const app = express();

// --------------- Security & Middleware ---------------
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --------------- Swagger Docs ---------------
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --------------- Rate Limiting ---------------
// CPU-intensive routes (Upload & Analysis)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: "Too many requests from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// --------------- API Routes ---------------
app.use("/api", healthRoutes);
app.use("/api", authRoutes);
app.use("/api/resumes", apiLimiter);
app.use("/api", resumeRoutes);
app.use("/api/analysis", apiLimiter);
app.use("/api", analysisRoutes);

// --------------- 404 Handler ---------------
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// --------------- Error Handler ---------------
app.use((err, req, res, next) => {
  const status = err.status || 500;

  // Always log the real error to the server console
  if (status >= 500) {
    console.error("Unhandled error:", err);
  } else {
    console.warn(`[${status}] ${err.message}`);
  }

  // Only send safe, user-friendly messages to the frontend.
  // Errors with an explicit .status (4xx) were thrown intentionally by our
  // controllers/services with a message meant for the user. 500s are
  // unexpected — never leak internal details (DB host, Prisma stack, etc.).
  const clientMessage =
    status < 500
      ? err.message || "Something went wrong."
      : "Something went wrong. Please try again later.";

  res.status(status).json({ error: clientMessage });
});

// --------------- Start Server ---------------
app.listen(env.PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📚 API Docs at http://localhost:${env.PORT}/api/docs`);
  console.log(`❤️  Health check at http://localhost:${env.PORT}/api/health\n`);
});

export default app;
