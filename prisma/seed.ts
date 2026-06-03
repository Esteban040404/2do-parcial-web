import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Users
  const adminPass = await bcrypt.hash('admin123', 10);
  const operatorPass = await bcrypt.hash('operator123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@stockflow.com' },
    update: {},
    create: { email: 'admin@stockflow.com', password: adminPass, role: 'ADMIN' },
  });

  const operator = await prisma.user.upsert({
    where: { email: 'operator@stockflow.com' },
    update: {},
    create: { email: 'operator@stockflow.com', password: operatorPass, role: 'OPERATOR' },
  });

  // Categories
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' },
  });

  const clothing = await prisma.category.upsert({
    where: { name: 'Clothing' },
    update: {},
    create: { name: 'Clothing' },
  });

  // Products
  await prisma.product.upsert({
    where: { sku: 'ELEC-001' },
    update: {},
    create: {
      name: 'Laptop Pro 15',
      sku: 'ELEC-001',
      stock: 5,
      minStock: 3,
      price: 1299.99,
      categoryId: electronics.id,
    },
  });

  await prisma.product.upsert({
    where: { sku: 'ELEC-002' },
    update: {},
    create: {
      name: 'Wireless Mouse',
      sku: 'ELEC-002',
      stock: 2,
      minStock: 5,
      price: 29.99,
      categoryId: electronics.id,
    },
  });

  await prisma.product.upsert({
    where: { sku: 'CLTH-001' },
    update: {},
    create: {
      name: 'T-Shirt L',
      sku: 'CLTH-001',
      stock: 50,
      minStock: 10,
      price: 19.99,
      categoryId: clothing.id,
    },
  });

  console.log('Seed complete');
  console.log(`Admin:    admin@stockflow.com / admin123`);
  console.log(`Operator: operator@stockflow.com / operator123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
