const { createClient } = require('@libsql/client')

const db = createClient({
  url: 'libsql://amit-hardware-kamtatiwari.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzE2NTYwODAsImlkIjoiMWVjMDUxOTgtNjBiYy00NjFlLWI1ZTktM2JjMzkyNGQxYWFjIiwicmlkIjoiOGFmYWFmY2YtYTQ0OS00Y2MyLTk0YmMtZjJmODRiOWEwOGQzIn0.Tw7u6Dtc7lNrnw3gEDB7QKKaq-2CHszfTa5N_TGzOV4J_DeEvGeTpgLWSk5iYqyIk7U8VDxEBeve13_TQ49zDA',
})

db.execute({
  sql: "UPDATE nishant_users SET status='active', expiry_date='2027-01-01' WHERE email=?",
  args: ['hamaramorcha1153@gmail.com']
}).then(r => console.log('Done', r)).catch(console.error)