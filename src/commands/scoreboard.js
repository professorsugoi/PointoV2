const { getAuthClient, readSheet } = require("../services/sheets");
const errorHandler = require("../utils/errorHandler");
const { EmbedBuilder } = require("discord.js");

module.exports = {
 name: "scoreboard",
 execute: async (message, args) => {
  try {
   const auth = await getAuthClient();
   const data = await readSheet(auth, "A2:Z");

   if (!data || data.length === 0) {
    return message.reply("No data found in the sheet.");
   }

   const teams = {};
   const headers = data[0];

   // process the data
   for (let i = 0; i < headers.length; i += 2) {
    const teamName = headers[i];
    if (teamName) {
     teams[teamName] = [];
     for (let j = 1; j < data.length; j++) {
      const username = data[j][i];
      const points = parseInt(data[j][i + 1]) || 0;
      if (username) {
       teams[teamName].push({ username, points });
      }
     }
    }
   }

   // Create embed
   const embed = new EmbedBuilder() //
    .setColor(0x0099ff) //
    .setTitle("Scoreboard"); //

   for (const [teamName, members] of Object.entries(teams)) {
    // sort by points
    members.sort((a, b) => b.points - a.points);

    const totalPoints = members.reduce((sum, member) => sum + member.points, 0);
    let teamText = "";

    members.forEach(({ username, points }) => {
     teamText += `${username}: ${points} points\n`;
    });

    embed.addFields({
     name: `${teamName} (${totalPoints} pts)`,
     value: teamText || "No members",
     inline: true,
    });
   }

   message.channel.send({ embeds: [embed] });
  } catch (error) {
   console.error("Error:", error);
   message.reply("An error occurred while fetching the scoreboard.");
   errorHandler(message.client, "scoreboard", error);
  }
 },
};
