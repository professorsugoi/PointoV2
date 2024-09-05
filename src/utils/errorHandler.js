const config = require("../utils/config");

module.exports = function errorHandler(client, commandName, error) {
 const errorChannel = client.channels.cache.get(config.error_logs);
 if (errorChannel) {
  errorChannel.send(`Error in ${commandName} command: ${error.message}`);
 }
};
