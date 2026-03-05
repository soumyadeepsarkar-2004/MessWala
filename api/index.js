const app = require('../backend/server.js');

// In serverless, wait for MongoDB to connect before handling the request
module.exports = async (req, res) => {
  if (app.dbReady) {
    try { await app.dbReady; } catch (e) { /* connection error already logged */ }
  }
  return app(req, res);
};
