const { getAuthClient, writeToSheet } = require("../services/sheets");
const errorHandler = require("../utils/errorHandler");

module.exports = {
 name: "write",
 execute: async (message, args) => {
  const [range, ...values] = args;
  try {
   const auth = await getAuthClient();
   await writeToSheet(auth, range, [values]);
   message.reply("Data written successfully!");
  } catch (error) {
   console.error("Error:", error);
   message.reply("An error occurred while writing to the sheet.");
   errorHandler(message.client, "write", error);
  }
 },
};
