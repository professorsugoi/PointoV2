const { getAuthClient, readSheet } = require("../services/sheets");
const errorHandler = require("../utils/errorHandler");

module.exports = {
 name: "read",
 execute: async (message, args) => {
  const [range] = args;
  try {
   const auth = await getAuthClient();
   const data = await readSheet(auth, range);
   message.reply(`Data: ${JSON.stringify(data)}`);
  } catch (error) {
   console.error("Error:", error);
   message.reply("An error occurred while reading the sheet.");
   errorHandler(message.client, "read", error);
  }
 },
};
