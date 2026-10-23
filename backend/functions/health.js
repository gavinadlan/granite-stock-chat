'use strict';
// GET /health (no auth): liveness probe used by monitoring and CI smoke tests.
const { handler } = require('../lib/http');

exports.handler = handler(async () => ({
  body: { status: 'ok', stage: process.env.STAGE || 'unknown', time: new Date().toISOString() },
}));
