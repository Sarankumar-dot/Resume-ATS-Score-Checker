// Express Application Entry Point

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import env from "./config/env.js";
import corsOptions from "./config/cors.js";
import swaggerSpec from "./config/swagger.js";

// Routes
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// --------------- Middleware ---------------
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --------------- Swagger Docs ---------------
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --------------- API Routes ---------------
app.use("/api", healthRoutes);
app.use("/api", authRoutes);

// --------------- 404 Handler ---------------
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// --------------- Error Handler ---------------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// --------------- Start Server ---------------
app.listen(env.PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📚 API Docs at http://localhost:${env.PORT}/api/docs`);
  console.log(`❤️  Health check at http://localhost:${env.PORT}/api/health\n`);
});

export default app;
