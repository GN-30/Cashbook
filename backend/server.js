require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const ledgerRoutes = require("./routes/ledgers");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main Routes
app.use("/api/auth", authRoutes);
app.use("/api/ledgers", ledgerRoutes);

app.get("/", (req, res) => {
  res.send("FlexiLedger API is running.");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
