import fs from 'fs';
import { env } from './config/env';
import { connectMainDatabase } from './config/database';
import app from './app';

async function start() {
  if (!fs.existsSync(env.UPLOAD_DIR)) {
    fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
  }

  await connectMainDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`FleetOS API listening on http://localhost:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });

  const shutdown = async () => {
    console.log('Shutting down...');
    server.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
