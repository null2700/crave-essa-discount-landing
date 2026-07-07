const bcrypt = require('bcryptjs');
const db = require('./db');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const question = (q) => new Promise((res) => rl.question(q, res));

(async () => {
  try {
    const username = (await question('Owner username: ')).trim();
    const password = (await question('Owner password: ')).trim();
    if (!username || !password) {
      console.error('username and password are required');
      process.exit(1);
    }
    const hash = bcrypt.hashSync(password, 10);
    const result = await db.createOwner({ username, passwordHash: hash });
    console.log('Owner created:', result);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create owner:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
