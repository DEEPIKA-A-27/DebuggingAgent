require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Start HTTP server immediately so Railway health checks pass
  const server = app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Try DB connection with retries (Railway MySQL may take time to be ready)
  let retries = 5;
  while (retries > 0) {
    try {
      await testConnection();
      console.log('✓ MySQL database connected');
      return;
    } catch (error) {
      retries--;
      console.error(`✗ DB connection failed (${retries} retries left): ${error.message}`);
      if (retries === 0) {
        console.error('✗ Could not connect to database. Check DB environment variables.');
        // Don't exit — keep server running so we can debug via Railway logs
      } else {
        // Wait 5 seconds before retrying
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
}

startServer();
