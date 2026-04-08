const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.join(__dirname, "..", ".env");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const DEFAULTS = {
  mongoUri: "mongodb://127.0.0.1:27017/shoe_shop",
  jwtSecret: "shoe-shop-dev-secret",
  port: 8000,
};

const config = {
  envFileExists: fs.existsSync(envPath),
  mongoUri: process.env.MONGO_URI || DEFAULTS.mongoUri,
  jwtSecret: process.env.JWT_SECRET || DEFAULTS.jwtSecret,
  port: Number(process.env.PORT) || DEFAULTS.port,
};

config.usingDefaultMongoUri = config.mongoUri === DEFAULTS.mongoUri;
config.usingDefaultJwtSecret = config.jwtSecret === DEFAULTS.jwtSecret;
config.usingDefaultPort = config.port === DEFAULTS.port;

module.exports = config;
