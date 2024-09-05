// not actual config file. see jsons/config.json

const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "..", "..", "jsons", "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

module.exports = config;
