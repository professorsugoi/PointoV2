const {
 getAuthClient,
 readSheet,
 writeToSheet,
} = require("../services/sheets");
const errorHandler = require("../utils/errorHandler");

module.exports = {
 name: "points",
 execute: async (message, args) => {
  if (args.length < 3) {
   return message.reply("Usage: !points <add/subtract> @username <amount>");
  }

  const action = args[0].toLowerCase();
  const mentionedUser = message.mentions.users.first();
  const amount = parseInt(args[args.length - 1]);

  if (!mentionedUser) {
   return message.reply("Please mention a valid user.");
  }

  if (isNaN(amount) || amount <= 0) {
   return message.reply("Please provide a valid positive number for points.");
  }

  if (action !== "add" && action !== "subtract") {
   return message.reply(
    'Please specify either "add" or "subtract" for the action.'
   );
  }

  const username = mentionedUser.username;

  try {
   const auth = await getAuthClient();
   const existingData = await readSheet(auth, "A2:Z");

   let userRow = -1;
   let userColumn = -1;
   let pointsColumn = -1;

   // Find the user and their points column
   for (let i = 0; i < existingData[0].length; i += 2) {
    for (let j = 1; j < existingData.length; j++) {
     if (
      existingData[j][i] &&
      existingData[j][i].toLowerCase() === username.toLowerCase()
     ) {
      userRow = j;
      userColumn = i;
      pointsColumn = i + 1;
      break;
     }
    }
    if (userRow !== -1) break;
   }

   if (userRow === -1) {
    return message.reply(`User "${username}" not found in any team.`);
   }

   // Calculate new points
   let currentPoints = parseInt(existingData[userRow][pointsColumn] || "0");
   let newPoints =
    action === "add" ? currentPoints + amount : currentPoints - amount;
   newPoints = Math.max(0, newPoints); // Ensure points don't go below 0

   // Update points in the sheet
   const columnLetter = String.fromCharCode(65 + pointsColumn);
   await writeToSheet(auth, `${columnLetter}${userRow + 2}`, [
    [newPoints.toString()],
   ]);

   const actionWord = action === "add" ? "added to" : "subtracted from";
   message.reply(
    `${amount} points ${actionWord} ${username}. New total: ${newPoints} points.`
   );
  } catch (error) {
   console.error("Error:", error);
   message.reply("An error occurred while updating points.");
   errorHandler(message.client, "points", error);
  }
 },
};
