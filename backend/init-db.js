const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:Ramram@localhost:5432/flexiledger",
});

const initializeDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ledgers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS schemas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ledger_id UUID REFERENCES ledgers(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
        fields JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        schema_id UUID REFERENCES schemas(id) ON DELETE CASCADE,
        ledger_id UUID REFERENCES ledgers(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database tables created successfully.");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    pool.end();
  }
};

initializeDB();
