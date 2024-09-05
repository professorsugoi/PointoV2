const {
 getAuthClient,
 readSheet,
 writeToSheet,
} = require("../services/sheets");
const errorHandler = require("../utils/errorHandler");
const { getAdmins } = require("./admin");

module.exports = {
 name: "team",
 execute: async (message, args) => {
  // check if user is on admin list
  const auth = await getAuthClient();
  const admins = await getAdmins(auth);
  if (!admins.includes(message.author.username)) {
   return message.reply("You don't have permission to use this command.");
  }

  if (args[0] !== "add" || args.length < 2) {
   return message.reply("Usage: !team add <team name>");
  }

  const teamName = args.slice(1).join(" ");

  try {
   const auth = await getAuthClient();

   // read existing teams to find the next empty column
   const existingData = await readSheet(auth, "A2:Z2");
   let nextColumn = 0;
   if (existingData && existingData[0]) {
    nextColumn = existingData[0].filter((cell) => cell !== "").length;
    if (nextColumn % 2 !== 0) nextColumn++; // use odd-numbered columns (A, C, E, etc.)
   }

   // check if the team already exists
   if (existingData && existingData[0]) {
    for (let i = 0; i < existingData[0].length; i += 2) {
     if (existingData[0][i].toLowerCase() === teamName.toLowerCase()) {
      return message.reply(`Team "${teamName}" already exists.`);
     }
    }
   }

   // write the new team name
   const columnLetter = String.fromCharCode(65 + nextColumn);
   await writeToSheet(auth, `${columnLetter}2`, [[teamName]]);

   message.reply(`Team "${teamName}" has been added successfully!`);
  } catch (error) {
   console.error("Error:", error);
   message.reply("An error occurred while adding the team.");
   errorHandler(message.client, "team add", error);
  }
 },
};
