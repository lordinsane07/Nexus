/**
 * Database Seed Script
 *
 * Creates test users and 10 sample pharmaceutical products.
 * Run with: npx tsx src/db/seed.ts
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import bcrypt from 'bcryptjs';
import { users, products } from './schema';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log('🌱 Seeding database...');

  // ── Create Users ─────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const sellerPassword = await bcrypt.hash('Seller@1234', 12);

  const [admin] = await db
    .insert(users)
    .values({
      email: 'admin@nexus.dev',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
    })
    .onConflictDoNothing()
    .returning();

  const [seller] = await db
    .insert(users)
    .values({
      email: 'seller@nexus.dev',
      name: 'Seller User',
      password: sellerPassword,
      role: 'seller',
    })
    .onConflictDoNothing()
    .returning();

  const buyerPassword = await bcrypt.hash('Buyer@1234', 12);
  const [buyer] = await db
    .insert(users)
    .values({
      email: 'buyer@nexus.dev',
      name: 'Buyer User',
      password: buyerPassword,
      role: 'buyer',
    })
    .onConflictDoNothing()
    .returning();

  const sellerId = seller?.id;
  if (!sellerId) {
    console.log('⚠️  Users already exist, skipping product seed');
    return;
  }

  console.log(`✅ Created admin: admin@nexus.dev`);
  console.log(`✅ Created seller: seller@nexus.dev`);
  console.log(`✅ Created buyer: buyer@nexus.dev`);

  // ── Create Products ──────────────────────────────────────────────────────
  const productData = [
    {
      sku: 'IBU-API-001',
      name: 'Ibuprofen API',
      description: 'Ibuprofen Active Pharmaceutical Ingredient, USP grade',
      category: 'NSAID',
      dimension: 'weight',
      baseUnit: 'g',
      stockQuantity: '50000.00000000',
      basePricePerUnit: '450.00000000',
    },
    {
      sku: 'PAR-API-001',
      name: 'Paracetamol API',
      description: 'Paracetamol (Acetaminophen) Active Pharmaceutical Ingredient',
      category: 'Analgesic',
      dimension: 'weight',
      baseUnit: 'g',
      stockQuantity: '75000.00000000',
      basePricePerUnit: '280.00000000',
    },
    {
      sku: 'MET-HCL-001',
      name: 'Metformin HCl',
      description: 'Metformin Hydrochloride API for antidiabetic formulations',
      category: 'Antidiabetic',
      dimension: 'weight',
      baseUnit: 'g',
      stockQuantity: '30000.00000000',
      basePricePerUnit: '320.50000000',
    },
    {
      sku: 'ETH-ABS-001',
      name: 'Absolute Ethanol',
      description: 'Absolute Ethanol ≥99.8%, suitable for HPLC and spectroscopy',
      category: 'Solvent',
      dimension: 'volume',
      baseUnit: 'mL',
      stockQuantity: '200000.00000000',
      basePricePerUnit: '2.50000000',
    },
    {
      sku: 'IPA-USP-001',
      name: 'Isopropyl Alcohol',
      description: 'Isopropyl Alcohol USP grade, 99%',
      category: 'Solvent',
      dimension: 'volume',
      baseUnit: 'mL',
      stockQuantity: '150000.00000000',
      basePricePerUnit: '1.80000000',
    },
    {
      sku: 'ACN-HPL-001',
      name: 'Acetonitrile HPLC',
      description: 'Acetonitrile HPLC grade, ≥99.9%',
      category: 'Solvent',
      dimension: 'volume',
      baseUnit: 'mL',
      stockQuantity: '100000.00000000',
      basePricePerUnit: '3.20000000',
    },
    {
      sku: 'OMP-API-001',
      name: 'Omeprazole API',
      description: 'Omeprazole API for proton pump inhibitor formulations',
      category: 'PPI',
      dimension: 'weight',
      baseUnit: 'g',
      stockQuantity: '10000.00000000',
      basePricePerUnit: '1250.00000000',
    },
    {
      sku: 'ATO-API-001',
      name: 'Atorvastatin API',
      description: 'Atorvastatin Calcium API for statin formulations',
      category: 'Statin',
      dimension: 'weight',
      baseUnit: 'g',
      stockQuantity: '8000.00000000',
      basePricePerUnit: '2100.00000000',
    },
    {
      sku: 'MCC-PH102',
      name: 'Microcrystalline Cellulose PH102',
      description: 'Microcrystalline Cellulose PH102, pharmaceutical excipient',
      category: 'Excipient',
      dimension: 'weight',
      baseUnit: 'g',
      stockQuantity: '500000.00000000',
      basePricePerUnit: '45.00000000',
    },
    {
      sku: 'VIA-AMB-20',
      name: 'Amber Glass Vials 20mL',
      description: 'Amber glass vials, 20mL capacity, Type I borosilicate glass',
      category: 'Packaging',
      dimension: 'count',
      baseUnit: 'unit',
      stockQuantity: '10000.00000000',
      basePricePerUnit: '12.50000000',
    },
  ];

  await db.insert(products).values(
    productData.map((p) => ({
      ...p,
      createdBy: sellerId,
    }))
  );

  console.log(`✅ Created ${productData.length} products`);

  // ── Create order number sequence ─────────────────────────────────────────
  try {
    await sql`CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1`;
    console.log('✅ Created order_number_seq sequence');
  } catch {
    console.log('ℹ️  order_number_seq sequence already exists');
  }

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────────');
  console.log('Admin:  admin@nexus.dev  / Admin@1234');
  console.log('Seller: seller@nexus.dev / Seller@1234');
  console.log('Buyer:  buyer@nexus.dev  / Buyer@1234');
  console.log('─────────────────────────────────────');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
