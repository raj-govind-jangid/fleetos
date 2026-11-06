/**
 * PM2 ecosystem file for FleetOS backend.
 *
 * Usage (from backend folder):
 *   pm2 start ecosystem.config.js
 *   pm2 save
 *
 * Notes:
 * - Make sure you run `npm run build` before starting in production,
 *   because the server runs from `dist/server.js`.
 * - Configuration values (PORT, Mongo URIs, JWT secret, etc.) are read
 *   from process.env via the backend's `src/config/env.ts`.
 */

module.exports = {
  apps: [
    {
      name: 'fleetos-backend',
      cwd: __dirname,
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

