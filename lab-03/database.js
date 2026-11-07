
const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite");

async function openDB() {
  return await sqlite.open({
    filename: "./books.db",
    driver: sqlite3.Database
  });
}

module.exports = openDB;
