const { google } = require("googleapis");
const { JWT } = require("google-auth-library");
const path = require("path");
const config = require("../utils/config");

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const CREDENTIALS_PATH = path.join(
 __dirname,
 "..",
 "..",
 "jsons",
 "credentials.json"
);

async function getAuthClient() {
 const credentials = require(CREDENTIALS_PATH);
 return new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: SCOPES,
 });
}

async function readSheet(auth, range) {
 const sheets = google.sheets({ version: "v4", auth });
 const response = await sheets.spreadsheets.values.get({
  spreadsheetId: config.spreadsheetId,
  range,
 });
 return response.data.values;
}

async function writeToSheet(auth, range, values) {
 const sheets = google.sheets({ version: "v4", auth });
 const response = await sheets.spreadsheets.values.update({
  spreadsheetId: config.spreadsheetId,
  range,
  valueInputOption: "RAW",
  resource: { values },
 });
 return response.data;
}

async function clearSheet(auth, range) {
 const sheets = google.sheets({ version: "v4", auth });
 const response = await sheets.spreadsheets.values.clear({
  spreadsheetId: config.spreadsheetId,
  range,
 });
 return response.data;
}

module.exports = {
 getAuthClient,
 readSheet,
 writeToSheet,
 clearSheet,
};
