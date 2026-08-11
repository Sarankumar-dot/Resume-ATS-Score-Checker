// Password hashing utilities using bcrypt

import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hash a plaintext password.
 * @param {string} plain - The plaintext password
 * @returns {Promise<string>} The bcrypt hash
 */
export async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 * @param {string} plain - The plaintext password
 * @param {string} hash - The bcrypt hash to compare against
 * @returns {Promise<boolean>} True if the password matches
 */
export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
