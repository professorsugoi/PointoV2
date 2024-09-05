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
   return message.reply("Usage: !user add <user> <team>");
  }

  const username = args[1];
  const teamName = args.slice(2).join(" ");

  try {
   const auth = await getAuthClient();

   // read existing data to find teams and the next empty row
   const existingData = await readSheet(auth, "A2:D");

   // find the team column
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

   // find the next empty row in the team's column
   let nextRow = 3; //REVIEW - adds to 3rd row to start
   for (let i = 1; i < existingData.length; i++) {
    if (!existingData[i][teamColumn]) {
     nextRow = i + 2; // +2 because we start from A2 and i is 0-indexed
     break;
    }
    if (i === existingData.length - 1) {
     nextRow = existingData.length + 2;
    }
   }

   // write the new user
   const columnLetter = String.fromCharCode(65 + teamColumn);
   await writeToSheet(auth, `${columnLetter}${nextRow}`, [[username]]);

   message.reply(
    `User "${username}" has been added to team "${teamName}" successfully!`
   );
  } catch (error) {
   console.error("Error:", error);
   message.reply("An error occurred while adding the user to the team.");
   errorHandler(message.client, "user add", error);
  }
 },
};
