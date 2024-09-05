const {
 getAuthClient,
 readSheet,
 writeToSheet,
} = require("../services/sheets");
const errorHandler = require("../utils/errorHandler");

module.exports = {
 name: "user",
 execute: async (message, args) => {
  if (args[0] !== "add" || args.length < 3) {
   return message.reply("Usage: !user add @username <team>");
  }

  // check if user was mentioned
  const mentionedUser = message.mentions.users.first();
  if (!mentionedUser) {
   return message.reply("Please mention a valid user to add to the team.");
  }

  const username = mentionedUser.username;
  const teamName = args.slice(2).join(" ");

  try {
   const auth = await getAuthClient();

   // read existing data to find teams and the next empty row
   const existingData = await readSheet(auth, "A2:Z");

   // find team column
   let teamColumn = -1;
   for (let i = 0; i < existingData[0].length; i += 2) {
    if (existingData[0][i].toLowerCase() === teamName.toLowerCase()) {
     teamColumn = i;
     break;
    }
   }

   if (teamColumn === -1) {
    return message.reply(
     `Team "${teamName}" not found. Please add the team first using !team add <team name>`
    );
   }

   // check if user is already in a team
   for (let i = 0; i < existingData[0].length; i += 2) {
    for (let j = 1; j < existingData.length; j++) {
     if (
      existingData[j][i] &&
      existingData[j][i].toLowerCase() === username.toLowerCase()
     ) {
      return message.reply(
       `User "${username}" is already in team "${existingData[0][i]}".`
      );
     }
    }
   }

   // find next empty row in the team's column
   let nextRow = 3; // TODO - start from row 3 since row 2 contains team names
   for (let i = 1; i < existingData.length; i++) {
    if (!existingData[i][teamColumn]) {
     nextRow = i + 2; // +2 because we start from A2 and i is 0-indexed
     break;
    }
    if (i === existingData.length - 1) {
     nextRow = existingData.length + 2;
    }
   }

   // Write the new user and initialize points
   const userColumnLetter = String.fromCharCode(65 + teamColumn);
   const pointsColumnLetter = String.fromCharCode(66 + teamColumn);
   await writeToSheet(
    auth,
    `${userColumnLetter}${nextRow}:${pointsColumnLetter}${nextRow}`,
    [[username, "0"]]
   );

   message.reply(
    `User "${username}" has been added to team "${teamName}" with 0 points.`
   );
  } catch (error) {
   console.error("Error:", error);
   message.reply("An error occurred while adding the user to the team.");
   errorHandler(message.client, "user add", error);
  }
 },
};
