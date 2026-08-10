import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Resume ATS Checker API",
      version: "0.1.0",
      description:
        "REST API for Resume ATS Checker — analyze resumes against job descriptions for ATS compatibility.",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "/api",
        description: "API base path",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
