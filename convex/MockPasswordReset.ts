import { EmailConfig } from "@auth/core/providers/email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

/**
 * Mock Email Provider for testing password resets.
 * We implement the EmailConfig interface directly to avoid importing
 * the actual providers which rely on 'nodemailer' (fails to bundle in Convex).
 */
export const MockPasswordReset: EmailConfig = {
  id: "mock-reset-otp",
  type: "email",
  name: "Mock Email",
  server: "mock",
  from: "mock@example.com",
  maxAge: 60 * 60, // 1 hour
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes) {
        crypto.getRandomValues(bytes);
      },
    };
    const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return generateRandomString(random, alphabet, 8);
  },
  async sendVerificationRequest({ identifier, token, url }) {
    console.log(`\n\n----------------------------------------`);
    console.log(`🔐 PASSWORD RESET REQUEST`);
    console.log(`📧 Email: ${identifier}`);
    console.log(`🔑 Reset Code: ${token}`);
    console.log(`----------------------------------------\n\n`);
  },
  options: {},
};
