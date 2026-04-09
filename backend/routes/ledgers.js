const express = require("express");
const db = require("../db");
const { authMiddleware } = require("./auth");

const router = express.Router();

router.use(authMiddleware);

// --- LEDGERS ---

// Get user's ledgers
router.get("/", async (req, res) => {
  try {
    const ledgers = await db.query(
      "SELECT * FROM ledgers WHERE user_id = $1 ORDER BY created_at DESC", 
      [req.user.userId]
    );
    res.json(ledgers.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create a ledger
router.post("/", async (req, res) => {
  const { name, description } = req.body;
  try {
    const newLedger = await db.query(
      "INSERT INTO ledgers (user_id, name, description) VALUES ($1, $2, $3) RETURNING *",
      [req.user.userId, name, description]
    );
    res.status(201).json(newLedger.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- SCHEMAS ---

// Get schemas for a ledger
router.get("/:ledgerId/schemas", async (req, res) => {
  try {
    const schemas = await db.query(
      "SELECT * FROM schemas WHERE ledger_id = $1", 
      [req.params.ledgerId]
    );
    // Automatically parsing JSONB is handled by pg
    res.json(schemas.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create a schema
router.post("/:ledgerId/schemas", async (req, res) => {
  const { name, type, fields } = req.body;
  // type: 'income' or 'expense'
  // fields: array of objects [{ name: 'Vendor', type: 'text' }, ...]
  try {
    const newSchema = await db.query(
      "INSERT INTO schemas (ledger_id, name, type, fields) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.params.ledgerId, name, type, JSON.stringify(fields)]
    );
    res.status(201).json(newSchema.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update a schema
router.put("/:ledgerId/schemas/:id", async (req, res) => {
  const { name, type, fields } = req.body;
  try {
    const updatedSchema = await db.query(
      "UPDATE schemas SET name = $1, type = $2, fields = $3 WHERE id = $4 AND ledger_id = $5 RETURNING *",
      [name, type, JSON.stringify(fields), req.params.id, req.params.ledgerId]
    );
    if (updatedSchema.rows.length === 0) {
      return res.status(404).json({ error: "Schema not found" });
    }
    res.json(updatedSchema.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- ENTRIES ---

// Get entries for a ledger
router.get("/:ledgerId/entries", async (req, res) => {
  try {
    const entries = await db.query(
      `SELECT e.*, s.name as schema_name, s.type as schema_type 
       FROM entries e 
       JOIN schemas s ON e.schema_id = s.id 
       WHERE e.ledger_id = $1 
       ORDER BY e.created_at DESC`,
      [req.params.ledgerId]
    );
    res.json(entries.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Create an entry
router.post("/:ledgerId/entries", async (req, res) => {
  const { schema_id, data } = req.body;
  try {
    const newEntry = await db.query(
      "INSERT INTO entries (schema_id, ledger_id, data) VALUES ($1, $2, $3) RETURNING *",
      [schema_id, req.params.ledgerId, JSON.stringify(data)]
    );
    res.status(201).json(newEntry.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete an entry
router.delete("/entries/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM entries WHERE id = $1", [req.params.id]);
    res.json({ message: "Entry deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
