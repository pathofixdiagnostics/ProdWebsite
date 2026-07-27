#!/usr/bin/env node
// Generates the admin credentials for the console. Run:
//   node scripts/hash-admin-password.mjs "your-password"
// or with no argument to be prompted. It prints the two env values to add to
// your .env — only the PBKDF2 hash is stored, never the plaintext password.

import crypto from "node:crypto";
import readline from "node:readline";

function hashPassword(password) {
  const iterations = 100_000; // > policy minimum of 75,000
  const salt = crypto.randomBytes(16); // 128-bit salt
  const dk = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256"); // 256-bit
  return `pbkdf2$sha256$${iterations}$${salt.toString("base64")}$${dk.toString("base64")}`;
}

async function getPassword() {
  const fromArg = process.argv[2];
  if (fromArg) return fromArg;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question("Choose an admin password (min 8 chars): ", (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

const password = await getPassword();
if (!password || password.length < 8) {
  console.error("Error: password must be at least 8 characters.");
  process.exit(1);
}

console.log("\nAdd these to your .env (never commit .env):\n");
console.log(`ADMIN_PASSWORD_HASH='${hashPassword(password)}'`);
console.log(`ADMIN_SESSION_SECRET='${crypto.randomBytes(32).toString("base64")}'`);
console.log("");
