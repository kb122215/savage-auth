// config/database.js
module.exports = {
  url: process.env.MONGO_URL,
  dbName: process.env.DB_NAME || "savage-fan-site",
};
