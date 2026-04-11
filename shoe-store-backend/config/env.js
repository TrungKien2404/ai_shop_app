const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.join(__dirname, "..", ".env");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const DEFAULTS = {
  jwtSecret: "shoe-shop-dev-secret",
  port: 8000,
};

const config = {
  envFileExists: fs.existsSync(envPath),
  jwtSecret: process.env.JWT_SECRET || DEFAULTS.jwtSecret,
  port: Number(process.env.PORT) || DEFAULTS.port,
};

config.usingDefaultJwtSecret = config.jwtSecret === DEFAULTS.jwtSecret;
config.usingDefaultPort = config.port === DEFAULTS.port;

module.exports = config;
