const { getAuthClient, clearSheet } = require("../services/sheets");
const errorHandler = require("../utils/errorHandler");

module.exports = {
 name: "clear",
 execute: async (message, args) => {
  const [range] = args;
  try {
   const auth = await getAuthClient();
   await clearSheet(auth, range);
   message.reply("Range cleared successfully!");
  } catch (error) {
   console.error("Error:", error);
   message.reply("An error occurred while clearing the sheet.");
   errorHandler(message.client, "clear", error);
  }
 },
};
