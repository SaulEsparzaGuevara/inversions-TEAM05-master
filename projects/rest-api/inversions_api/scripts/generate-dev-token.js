const fs = require("node:fs");
const path = require("node:path");
const jwt = require("jsonwebtoken");

function readJwtSecret(envPath) {
  if (!fs.existsSync(envPath)) {
    throw new Error(`No existe .env en ${envPath}`);
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  const jwtLine = lines.find((line) => line.startsWith("JWT_SECRET="));

  if (!jwtLine) {
    throw new Error("No se encontro JWT_SECRET en .env");
  }

  const secret = jwtLine.slice("JWT_SECRET=".length).trim();
  if (!secret) {
    throw new Error("JWT_SECRET esta vacio en .env");
  }

  if (secret.length <= 32 || secret.includes("REPLACE_WITH")) {
    throw new Error("JWT_SECRET invalido para desarrollo. Usa un valor real de mas de 32 caracteres.");
  }

  return secret;
}

function main() {
  const envPath = path.resolve(process.cwd(), ".env");
  const secret = readJwtSecret(envPath);

  const token = jwt.sign(
    {
      sub: process.env.DEV_TOKEN_SUB ?? "dev-user",
      role: process.env.DEV_TOKEN_ROLE ?? "trader",
      email: process.env.DEV_TOKEN_EMAIL ?? "dev@local"
    },
    secret,
    {
      algorithm: "HS256",
      expiresIn: process.env.DEV_TOKEN_EXPIRES_IN ?? "7d"
    }
  );

  console.log(token);
}

main();