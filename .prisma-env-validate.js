require('dotenv/config');
const { URL } = require('url');
['DATABASE_URL', 'DIRECT_URL'].forEach((name) => {
  const value = process.env[name];
  console.log(`\n${name}:`, value ? 'loaded' : 'missing');
  if (!value) return;
  try {
    const u = new URL(value);
    console.log('  protocol:', u.protocol);
    console.log('  username:', u.username);
    console.log('  password:', u.password ? '[redacted]' : '(none)');
    console.log('  host:', u.hostname);
    console.log('  port:', u.port);
    console.log('  pathname:', u.pathname);
    console.log('  search:', u.search);
  } catch (err) {
    console.error('  parse error:', err.message);
  }
});
