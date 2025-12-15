/**
 * Script untuk generate bcrypt hash dari password
 * 
 * Usage:
 * node scripts/hash-password.js password123
 */

const bcrypt = require('bcrypt');

const password = process.argv[2] || 'password123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('\n=== Password Hash Generated ===\n');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nCopy hash ini ke seed.sql\n');
});
