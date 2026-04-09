const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:Ramram@localhost:5432/flexiledger",
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("Error acquiring client", err.stack);
  } else {
    console.log("Connected to PostgreSQL Database");
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
