const {
 getAuthClient,
 readSheet,
 writeToSheet,
} = require("../services/sheets");
const errorHandler = require("../utils/errorHandler");
const config = require("../utils/config");

async function getAdmins(auth) {
 try {
  const response = await readSheet(auth, "Admins!A:A");
  return response ? response.flat() : [];
 } catch (error) {
  console.error("Error reading admin list:", error);
  return [];
 }
}

async function addAdmin(auth, username) {
 try {
  const admins = await getAdmins(auth);
  if (!admins.includes(username)) {
   await writeToSheet(auth, "Admins!A:A", [[username]], "APPEND");
  }
 } catch (error) {
  console.error("Error adding admin:", error);
  throw error;
 }
}

async function removeAdmin(auth, username) {
 try {
  const admins = await getAdmins(auth);
  const updatedAdmins = admins.filter((admin) => admin !== username);
  await writeToSheet(
   auth,
   "Admins!A:A",
   updatedAdmins.map((admin) => [admin])
  );
 } catch (error) {
  console.error("Error removing admin:", error);
  throw error;
 }
}

module.exports = {
 name: "admin",
 execute: async (message, args) => {
  const isServerOwner = message.author.id === message.guild.ownerId;
  const isBotOwner = message.author.id === config.botOwnerId;

  if (
   args.length === 0 ||
   (args[0].toLowerCase() === "list" && args.length === 1)
  ) {
   // anyone can view the admin list
   try {
    const auth = await getAuthClient();
    const admins = await getAdmins(auth);
    if (admins.length === 0) {
     return message.reply("There are no admins in the list.");
    }
    const adminList = admins.join(", ");
    return message.reply(`Current admins: ${adminList}`);
   } catch (error) {
    console.error("Error:", error);
    message.reply("An error occurred while fetching the admin list.");
    return errorHandler(message.client, "admin list", error);
   }
  }

  // for add and remove actions, check permissions
  if (!isServerOwner && !isBotOwner) {
   return message.reply(
    "Only the server owner or bot owner can manage admins."
   );
  }

  if (args.length < 2) {
   return message.reply("Usage: !admin <add/remove> @username");
  }

  const action = args[0].toLowerCase();
  const mentionedUser = message.mentions.users.first();

  if (!mentionedUser) {
   return message.reply("Please mention a valid user.");
  }

  const username = mentionedUser.username;

  try {
   const auth = await getAuthClient();

   if (action === "add") {
    await addAdmin(auth, username);
    message.reply(`${username} has been added to the admin list.`);
   } else if (action === "remove") {
    await removeAdmin(auth, username);
    message.reply(`${username} has been removed from the admin list.`);
   } else {
    message.reply('Invalid action. Use "add", "remove", or "list".');
   }
  } catch (error) {
   console.error("Error:", error);
   message.reply("An error occurred while managing admins.");
   errorHandler(message.client, "admin", error);
  }
 },
 getAdmins,
};
