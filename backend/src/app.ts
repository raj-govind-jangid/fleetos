import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import driverRoutes from './routes/driver.routes';
import tripRoutes from './routes/trip.routes';
import fuelRoutes from './routes/fuel.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import expenseRoutes from './routes/expense.routes';
import alertRoutes from './routes/alert.routes';
import dashboardRoutes from './routes/dashboard.routes';
import organizationRoutes from './routes/organization.routes';
import documentRoutes from './routes/document.routes';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'FleetOS API is running', data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/documents', documentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
