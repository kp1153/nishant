const { createClient } = require('@libsql/client');

const db = createClient({
  url: 'https://amit-hardware-kamtatiwari.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzE2NTYwODAsImlkIjoiMWVjMDUxOTgtNjBiYy00NjFlLWI1ZTktM2JjMzkyNGQxYWFjIiwicmlkIjoiOGFmYWFmY2YtYTQ0OS00Y2MyLTk0YmMtZjJmODRiOWEwOGQzIn0.Tw7u6Dtc7lNrnw3gEDB7QKKaq-2CHszfTa5N_TGzOV4J_DeEvGeTpgLWSk5iYqyIk7U8VDxEBeve13_TQ49zDA',
});

(async () => {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS nishant_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        email TEXT UNIQUE,
        password TEXT,
        status TEXT,
        expiry_date TEXT
      )
    `);

    console.log("Table ready");

    const res = await db.execute({
      sql: "UPDATE nishant_users SET status='active', expiry_date='2027-01-01' WHERE email=?",
      args: ['hamaramorcha1153@gmail.com']
    });

    console.log("Done", res);

  } catch (err) {
    console.error("Error:", err);
  }
})();