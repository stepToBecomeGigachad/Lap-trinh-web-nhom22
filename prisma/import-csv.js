import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const RESET_ORDERS = process.env.RESET_ORDERS === '1';
const RESET_CARTS = process.env.RESET_CARTS === '1';

const ALG = 'scrypt';
const KEYLEN = 64;

function hashPassword(password) {
    const salt = crypto.randomBytes(16);
    const hash = crypto.scryptSync(password, salt, KEYLEN);
    return `${ALG}:${salt.toString('hex')}:${hash.toString('hex')}`;
}

async function main() {
    console.log('Starting import from CSV...');

    // Read and parse CSV (file is in prisma folder)
    const csvPath = join(__dirname, 'book_title.csv');
    let csvContent = readFileSync(csvPath, 'utf-8');
    // Remove BOM if present
    if (csvContent.charCodeAt(0) === 0xFEFF) {
        csvContent = csvContent.slice(1);
    }
    // Also try to remove UTF-8 BOM bytes
    csvContent = csvContent.replace(/^\uFEFF/, '');

    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,  // Handle BOM automatically
    });

    console.log(`Found ${records.length} products in CSV`);

    // Get unique categories from CSV
    const categorySet = new Set(records.map(r => r.categorySlug).filter(Boolean));
    const categoryNames = {
        'forensics': 'Forensics',
        'networking': 'Networking',
        'pwnable': 'Pwnable',
        'malware-analysis': 'Malware Analysis',
        'reverse-engineering': 'Reverse Engineering',
        'cryptography': 'Cryptography',
    };

    // Create categories
    console.log('Creating categories...');
    for (const slug of categorySet) {
        await prisma.category.upsert({
            where: { slug },
            update: {},
            create: { slug, name: categoryNames[slug] || slug },
        });
    }

    // Get category IDs
    const cats = await prisma.category.findMany();
    const catIdBySlug = Object.fromEntries(cats.map(c => [c.slug, c.id]));

    const orderItemCount = await prisma.orderItem.count();
    if (orderItemCount > 0 && !RESET_ORDERS) {
        console.error('Orders exist. Set RESET_ORDERS=1 to delete orders and re-import products.');
        process.exit(1);
    }

    const savedCartItemCount = await prisma.savedCartItem.count();
    if (savedCartItemCount > 0 && !RESET_CARTS) {
        console.error('Saved carts exist. Set RESET_CARTS=1 to delete saved carts and re-import products.');
        process.exit(1);
    }

    if (RESET_ORDERS) {
        console.log('RESET_ORDERS=1: Clearing orders and order items...');
        await prisma.orderItem.deleteMany({});
        await prisma.order.deleteMany({});
    }

    if (RESET_CARTS) {
        console.log('RESET_CARTS=1: Clearing saved carts and items...');
        await prisma.savedCartItem.deleteMany({});
        await prisma.savedCart.deleteMany({});
    }

    // Delete old products (this will also delete related images due to cascade)
    console.log('Clearing old products...');
    await prisma.productImage.deleteMany({});
    await prisma.product.deleteMany({});

    // Import products
    console.log('Importing products...');
    let imported = 0;
    for (const row of records) {
        if (!row.slug || !row.name || !row.price || !row.categorySlug) {
            console.log(`Skipping invalid row: ${row.slug || 'no slug'}`);
            continue;
        }

        const categoryId = catIdBySlug[row.categorySlug];
        if (!categoryId) {
            console.log(`Category not found for: ${row.slug} (${row.categorySlug})`);
            continue;
        }

        try {
            await prisma.product.create({
                data: {
                    slug: row.slug,
                    name: row.name,
                    description: row.description || '',
                    price: parseFloat(row.price) || 0,
                    salePrice: row.salePrice ? parseFloat(row.salePrice) : null,
                    brand: row.brand || null,
                    stock: parseInt(row.stock) || 0,
                    categoryId,
                    images: row.images ? {
                        create: [{ url: row.images }]
                    } : undefined,
                },
            });
            imported++;
        } catch (err) {
            console.error(`Error importing ${row.slug}:`, err.message);
        }
    }

    // Create admin user
    console.log('Creating admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@test.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Test.123';
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: { role: 'ADMIN' },
        create: {
            name: 'Admin',
            email: adminEmail,
            passwordHash: hashPassword(adminPassword),
            role: 'ADMIN',
        },
    });

    // Create sample coupons
    console.log('Creating sample coupons...');
    const coupons = [
        {
            code: 'WELCOME10',
            description: 'Giảm 10% cho khách hàng mới',
            discountType: 'percent',
            discountValue: 10,
            minOrderValue: 100000,
            maxDiscount: 50000,
            isActive: true,
        },
        {
            code: 'SALE50K',
            description: 'Giảm 50.000đ cho đơn từ 300.000đ',
            discountType: 'fixed',
            discountValue: 50000,
            minOrderValue: 300000,
            isActive: true,
        },
    ];

    for (const c of coupons) {
        await prisma.coupon.upsert({
            where: { code: c.code },
            update: {},
            create: c,
        });
    }

    console.log(`\n✅ Import completed!`);
    console.log(`   - ${imported} products imported`);
    console.log(`   - ${categorySet.size} categories created`);
    console.log(`   - Admin user created`);
    console.log(`   - Sample coupons created`);
}

main()
    .catch((e) => {
        console.error('Import failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
