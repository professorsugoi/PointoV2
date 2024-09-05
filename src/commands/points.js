const {
 getAuthClient,
 readSheet,
 writeToSheet,
} = require("../services/sheets");
const errorHandler = require("../utils/errorHandler");

module.exports = {
 name: "points",
 execute: async (message, args) => {
  const auth = await getAuthClient();
  const admins = await getAdmins(auth);
  const isAdmin = admins.includes(message.author.username);

  if (args.length < 2) {
   return message.reply(
    "Usage: !points <add/subtract> [amount] OR !points <add/subtract> @username <amount> (admin only)"
   );
  }

  const action = args[0].toLowerCase();
  if (action !== "add" && action !== "subtract") {
   return message.reply(
    'Please specify either "add" or "subtract" for the action.'
   );
  }

  let targetUser, amount;

  if (args.length === 2) {
   // User is modifying their own points
   targetUser = message.author;
   amount = parseInt(args[1]);
  } else {
   // Admin is modifying someone else's points
   if (!isAdmin) {
    return message.reply(
     "You don't have permission to modify other users' points."
    );
   }
   targetUser = message.mentions.users.first();
   amount = parseInt(args[args.length - 1]);
  }

  if (!targetUser) {
   return message.reply(
    "Please mention a valid user or use the command without mentioning anyone to modify your own points."
   );
  }

  if (isNaN(amount) || amount <= 0) {
   return message.reply("Please provide a valid positive number for points.");
  }

  const username = targetUser.username;

  try {
   const auth = await getAuthClient();
   const existingData = await readSheet(auth, "A2:Z");

   let userRow = -1;
   let userColumn = -1;
   let pointsColumn = -1;

   // find the user and their points column
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

   // calculate new point total
   let currentPoints = parseInt(existingData[userRow][pointsColumn] || "0");
   let newPoints =
    action === "add" ? currentPoints + amount : currentPoints - amount;
   newPoints = Math.max(0, newPoints); // ensure points don't go below 0

   // update points in the sheet
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
