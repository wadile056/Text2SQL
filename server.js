import express from "express";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

app.use(express.json());
app.use(express.static("public"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let db = null;

// Generate SQL with retries for temporary Gemini errors
// Generate SQL with retries and strict spelling preservation
async function generateSQL(question) {
  for (let i = 0; i < 3; i++) {
    try {
      const result = await ai.models.generateContent({
        model: MODEL,

        contents: `
You are a precise Text-to-SQL generator for MySQL.

RULES:
1. Convert the user's request into a valid MySQL SELECT query.
2. Preserve the EXACT spelling of all names, cities, locations,
   identifiers, and filter values provided by the user.
3. NEVER autocorrect, normalize, translate, or change user-provided values.
4. If the user writes "Ranjane", use 'Ranjane', NOT 'Ranjana'.
5. Do not replace a user-provided value with a similar-sounding word.
6. Use the exact user-provided text for SQL filter values.
7. Do not invent names, cities, or other filter values.
8. Return ONLY the SQL query.
9. Do not include Markdown, code fences, or explanations.
10. Generate a SELECT query only.

USER REQUEST:
<question>
${question}
</question>

SQL:
        `,

        config: {
          temperature: 0,
          maxOutputTokens: 256,
        },
      });

      return result;
    } catch (err) {
      const msg = `${err.status} ${err.message}`.toUpperCase();

      const temporary =
        msg.includes("503") ||
        msg.includes("UNAVAILABLE") ||
        msg.includes("HIGH DEMAND") ||
        msg.includes("429") ||
        msg.includes("RESOURCE_EXHAUSTED");

      if (!temporary || i === 2) {
        throw err;
      }

      await sleep(1000 * 2 ** i);
    }
  }
}

// Generate SQL
app.post("/api/generate", async (req, res) => {
  const question = req.body?.question?.trim();

  if (!question)
    return res.status(400).json({ error: "Please type an instruction." });

  const start = Date.now();

  try {
    const result = await generateSQL(question);
    const sql = result.text?.trim();
    if (!sql)
      return res
        .status(502)
        .json({ error: "Gemini returned an empty response." });

    if (db) {
      db.execute("INSERT INTO history (question, sql_query) VALUES (?, ?)", [
        question,
        sql,
      ]).catch((err) => console.error("History error:", err.message));
    }

    res.json({ sql });
  } catch (err) {
    console.error("Gemini error:", err.message);

    const msg = `${err.status} ${err.message}`.toUpperCase();

    if (msg.includes("503") || msg.includes("UNAVAILABLE"))
      return res
        .status(503)
        .json({ error: "Gemini is busy. Please try again shortly." });

    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED"))
      return res
        .status(429)
        .json({ error: "API limit reached. Try again later." });

    res
      .status(500)
      .json({ error: "SQL generation failed. Check the server terminal." });
  }
});

// Connect to MySQL
async function connectDB() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME = "text2sql" } = process.env;

  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  } finally {
    await connection.end();
  }

  db = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  await db.query(`
    CREATE TABLE IF NOT EXISTS history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question TEXT NOT NULL,
      sql_query TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

connectDB()
  .then(() => console.log("MySQL connected"))
  .catch((err) => console.error("History disabled:", err.message))
  .finally(() => {
    app.listen(PORT, () =>
      console.log(`Server running at http://localhost:${PORT}`),
    );
  });
