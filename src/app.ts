import express from 'express';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import reportRoutes from './routes/report.routes';
import swaggerRouter from './swagger';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = process.env['PORT'] ?? 3008;

app.use(express.json());

app.use('/docs', swaggerRouter);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`StockFlow API running on http://localhost:${PORT}`);
});

export default app;
