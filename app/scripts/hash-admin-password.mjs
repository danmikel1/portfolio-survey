import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });
const password = await rl.question("Enter admin password to hash (cost 12): ");
rl.close();

if (!password || password.length < 12) {
  console.error("Error: Use a strong password of at least 12 characters.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const b64Hash = Buffer.from(hash, "utf8").toString("base64");

console.log("\nRecommended (base64-encoded bcrypt — avoids $ expansion in .env & Docker Compose):");
console.log(`ADMIN_PASSWORD_HASH=${b64Hash}`);
