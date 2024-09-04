const { Client, GatewayIntentBits } = require("discord.js");
const { google } = require("googleapis");
const { JWT } = require("google-auth-library");
const fs = require("fs");
const path = require("path");

// Load the configuration file
const configPath = path.join(__dirname, "jsons", "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const client = new Client({
 intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
 ],
});

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const CREDENTIALS_PATH = path.join(__dirname, "jsons", "credentials.json");

async function getAuthClient() {
 const credentials = require(CREDENTIALS_PATH);
 return new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: SCOPES,
 });
}

async function readSheet(auth, range) {
 const sheets = google.sheets({ version: "v4", auth });
 const response = await sheets.spreadsheets.values.get({
  spreadsheetId: config.spreadsheetId,
  range,
 });
 return response.data.values;
}

async function writeToSheet(auth, range, values) {
 const sheets = google.sheets({ version: "v4", auth });
 const response = await sheets.spreadsheets.values.update({
  spreadsheetId: config.spreadsheetId,
  range,
  valueInputOption: "RAW",
  resource: { values },
 });
 return response.data;
}

async function clearSheet(auth, range) {
 const sheets = google.sheets({ version: "v4", auth });
 const response = await sheets.spreadsheets.values.clear({
  spreadsheetId: config.spreadsheetId,
  range,
 });
 return response.data;
}

client.on("ready", () => {
 console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
 if (message.author.bot) return;
 if (!message.content.startsWith(config.prefix)) return;

 const args = message.content.slice(config.prefix.length).trim().split(/ +/);
 const command = args.shift().toLowerCase();

 // Example command: !read range
 if (command === "read") {
  const [range] = args;
  try {
   const auth = await getAuthClient();
   const data = await readSheet(auth, range);
   message.reply(`Data: ${JSON.stringify(data)}`);
  } catch (error) {
   console.error("Error:", error);
   message.reply("An error occurred while reading the sheet.");
   // Log error to the specified channel
   const errorChannel = client.channels.cache.get(config.error_logs);
   if (errorChannel) {
    errorChannel.send(`Error in read command: ${error.message}`);
   }
  }
 }

 // Example command: !write range value1 value2 ...
 if (command === "write") {
  const [range, ...values] = args;
  try {
   const auth = await getAuthClient();
   await writeToSheet(auth, range, [values]);
   message.reply("Data written successfully!");
  } catch (error) {
   console.error("Error:", error);
   message.reply("An error occurred while writing to the sheet.");
   // Log error to the specified channel
   const errorChannel = client.channels.cache.get(config.error_logs);
   if (errorChannel) {
    errorChannel.send(`Error in write command: ${error.message}`);
   }
  }
 }

 // Example command: !clear range
 if (command === "clear") {
  const [range] = args;
  try {
   const auth = await getAuthClient();
   await clearSheet(auth, range);
   message.reply("Range cleared successfully!");
  } catch (error) {
   console.error("Error:", error);
   message.reply("An error occurred while clearing the sheet.");
   // Log error to the specified channel
   const errorChannel = client.channels.cache.get(config.error_logs);
   if (errorChannel) {
    errorChannel.send(`Error in clear command: ${error.message}`);
   }
  }
 }
});

client.login(config.botToken);
