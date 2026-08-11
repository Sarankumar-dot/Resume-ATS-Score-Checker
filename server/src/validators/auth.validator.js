// Auth Validators — Zod schemas for authentication endpoints

import { z } from "zod";

/**
 * Schema for POST /api/auth/signup
 */
export const signupSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email address"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters"),
    name: z
      .string({ required_error: "Name is required" })
      .min(1, "Name cannot be empty")
      .max(100, "Name must be 100 characters or fewer"),
  }),
});

/**
 * Schema for POST /api/auth/login
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email address"),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required"),
  }),
});
